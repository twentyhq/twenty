import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { type ApplicationVariableCacheMaps } from 'src/engine/core-modules/application/application-variable/types/application-variable-cache-maps.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type GetEnvVariablesArgs = {
  workspaceId: string;
  applicationId: string;
  applicationVariableMaps?: ApplicationVariableCacheMaps;
};

@Injectable()
export class ApplicationVariableEntityService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  getDisplayValue(applicationVariable: ApplicationVariableEntity): string {
    if (applicationVariable.value === '') {
      return '';
    }

    const plaintextValue = this.secretEncryptionService.decryptVersionedOrThrow(
      applicationVariable.value,
      { workspaceId: applicationVariable.workspaceId },
    );

    if (plaintextValue === '') {
      return '';
    }

    if (applicationVariable.isSecret) {
      return this.secretEncryptionService.maskDecryptedValue(
        plaintextValue,
        SECRET_APPLICATION_VARIABLE_MASK,
      );
    }

    return plaintextValue;
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
    applicationVariableMaps: preloadedApplicationVariableMaps,
  }: GetEnvVariablesArgs): Promise<FlatApplicationVariable[]> {
    const applicationVariableMaps =
      preloadedApplicationVariableMaps ??
      (
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'applicationVariableMaps',
        ])
      ).applicationVariableMaps;

    const universalIdentifiers =
      applicationVariableMaps.universalIdentifiersByApplicationId[
        applicationId
      ] ?? [];

    return universalIdentifiers
      .map(
        (universalIdentifier) =>
          applicationVariableMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined);
  }

  private toEnvVariables(
    flatApplicationVariables: FlatApplicationVariable[],
  ): Record<string, string> {
    return flatApplicationVariables.reduce<Record<string, string>>(
      (acc, flatApplicationVariable) => {
        acc[flatApplicationVariable.key] = this.decryptValue(
          flatApplicationVariable,
        );

        return acc;
      },
      {},
    );
  }

  private decryptValue({
    value,
    workspaceId,
  }: FlatApplicationVariable): string {
    if (value === '') {
      return '';
    }

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
    const existingVariable = await this.applicationVariableRepository.findOne({
      where: { key, applicationId },
    });

    if (!isDefined(existingVariable)) {
      throw new ApplicationVariableEntityException(
        `Application variable with key ${key} not found`,
        ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
      );
    }

    await this.applicationVariableRepository.update(
      { key, applicationId },
      {
        value: this.secretEncryptionService.encryptVersioned(plainTextValue, {
          workspaceId,
        }),
      },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'applicationVariableMaps',
    ]);
  }
}
