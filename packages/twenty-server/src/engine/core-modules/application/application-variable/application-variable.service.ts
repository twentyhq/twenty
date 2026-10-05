import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationVariableFileService } from 'src/engine/core-modules/application/application-variable/application-variable-file.service';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { type FlatApplicationVariableMaps } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable-maps.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type GetEnvVariablesArgs = {
  workspaceId: string;
  applicationId: string;
  flatApplicationVariableMaps?: FlatApplicationVariableMaps;
};

@Injectable()
export class ApplicationVariableEntityService {
  constructor(
    @InjectWorkspaceScopedRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: WorkspaceScopedRepository<ApplicationVariableEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly secretEncryptionService: SecretEncryptionService,
    private readonly applicationVariableFileService: ApplicationVariableFileService,
  ) {}

  async getDisplayValue(
    applicationVariable: ApplicationVariableEntity,
  ): Promise<string> {
    const plaintextValue = this.decryptValue(applicationVariable);

    if (plaintextValue === '') {
      return '';
    }

    if (applicationVariable.isSecret) {
      return this.secretEncryptionService.maskDecryptedValue(
        plaintextValue,
        SECRET_APPLICATION_VARIABLE_MASK,
      );
    }

    return this.toReadableValue({
      type: applicationVariable.type,
      signUrl: applicationVariable.signUrl,
      plaintextValue,
      workspaceId: applicationVariable.workspaceId,
    });
  }

  async getServerEnvVariables(
    args: GetEnvVariablesArgs,
  ): Promise<Record<string, string>> {
    const flatApplicationVariables =
      await this.findFlatApplicationVariables(args);

    return this.toEnvVariables(flatApplicationVariables);
  }

  async getPublicEnvVariables(
    args: GetEnvVariablesArgs,
  ): Promise<Record<string, string>> {
    const flatApplicationVariables =
      await this.findFlatApplicationVariables(args);

    return this.toEnvVariables(
      flatApplicationVariables.filter(({ isSecret }) => !isSecret),
    );
  }

  private async findFlatApplicationVariables({
    workspaceId,
    applicationId,
    flatApplicationVariableMaps: preloadedFlatApplicationVariableMaps,
  }: GetEnvVariablesArgs): Promise<FlatApplicationVariable[]> {
    const flatApplicationVariableMaps =
      preloadedFlatApplicationVariableMaps ??
      (
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatApplicationVariableMaps',
        ])
      ).flatApplicationVariableMaps;

    const universalIdentifiers =
      flatApplicationVariableMaps.universalIdentifiersByApplicationId[
        applicationId
      ] ?? [];

    return universalIdentifiers
      .map(
        (universalIdentifier) =>
          flatApplicationVariableMaps.byUniversalIdentifier[
            universalIdentifier
          ],
      )
      .filter(isDefined);
  }

  private async toEnvVariables(
    flatApplicationVariables: FlatApplicationVariable[],
  ): Promise<Record<string, string>> {
    const envVariableEntries = await Promise.all(
      flatApplicationVariables.map(
        async (flatApplicationVariable) =>
          [
            flatApplicationVariable.key,
            await this.toReadableValue({
              type: flatApplicationVariable.type,
              signUrl: flatApplicationVariable.signUrl,
              plaintextValue: this.decryptValue(flatApplicationVariable),
              workspaceId: flatApplicationVariable.workspaceId,
            }),
          ] as const,
      ),
    );

    return Object.fromEntries(envVariableEntries);
  }

  private async toReadableValue({
    type,
    signUrl,
    plaintextValue,
    workspaceId,
  }: Pick<FlatApplicationVariable, 'type' | 'signUrl' | 'workspaceId'> & {
    plaintextValue: string;
  }): Promise<string> {
    if (type !== FieldMetadataType.FILES) {
      return plaintextValue;
    }

    return this.applicationVariableFileService.signFilesValue({
      plaintextValue,
      workspaceId,
      signUrl,
    });
  }

  private decryptValue({
    value,
    workspaceId,
  }: Pick<FlatApplicationVariable, 'value' | 'workspaceId'>): string {
    return this.secretEncryptionService.decryptVersionedOrThrow(value, {
      workspaceId,
    });
  }

  async update({
    key,
    plainTextValue,
    applicationId,
    workspaceId,
  }: Pick<ApplicationVariableEntity, 'key'> & {
    applicationId: string;
    workspaceId: string;
    plainTextValue: PlaintextString;
  }) {
    const existingVariable = await this.applicationVariableRepository.findOne(
      workspaceId,
      { where: { key, applicationId } },
    );

    if (!isDefined(existingVariable)) {
      throw new ApplicationVariableEntityException(
        `Application variable with key ${key} not found`,
        ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
      );
    }

    const filesValueUpdate =
      existingVariable.type === FieldMetadataType.FILES
        ? await this.applicationVariableFileService.prepareFilesValueUpdate({
            applicationId,
            workspaceId,
            previousPlaintextValue: this.decryptValue(existingVariable),
            nextPlaintextValue: plainTextValue,
          })
        : undefined;

    const plaintextValueToStore = (filesValueUpdate?.plaintextValueToStore ??
      plainTextValue) as PlaintextString;

    await this.applicationVariableRepository.update(
      workspaceId,
      { key, applicationId },
      {
        value: this.secretEncryptionService.encryptVersioned(
          plaintextValueToStore,
          { workspaceId },
        ),
      },
    );

    if (isDefined(filesValueUpdate)) {
      await this.applicationVariableFileService.applyFilesValueUpdate({
        ...filesValueUpdate,
        workspaceId,
      });
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatApplicationVariableMaps',
    ]);
  }
}
