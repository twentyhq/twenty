import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ServerVariables } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, type EntityManager, type Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ApplicationRegistrationVariableFileService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable-file.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import {
  type UpdateApplicationRegistrationVariableInput,
  type UpdateApplicationRegistrationVariablePayload,
} from 'src/engine/core-modules/application/application-registration-variable/dtos/update-application-registration-variable.input';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplicationRegistrationOrThrow } from 'src/engine/core-modules/application/utils/can-caller-reach-application-registration-or-throw.util';
import { findEngineInjectedEnvVariableNames } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/find-engine-injected-env-variable-names.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ApplicationRegistrationVariableDTO } from 'src/engine/core-modules/application/application-registration-variable/dtos/application-registration-variable.dto';

@Injectable()
export class ApplicationRegistrationVariableService {
  constructor(
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly variableRepository: Repository<ApplicationRegistrationVariableEntity>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    // Answers "which workspaces installed this registration" for the whole
    // instance, so the query filters by registration rather than workspace.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly encryptionService: SecretEncryptionService,
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    private readonly applicationRegistrationVariableFileService: ApplicationRegistrationVariableFileService,
  ) {}

  async findVariablesWithObfuscatedValues({
    applicationRegistrationId,
    workspaceId,
  }: {
    applicationRegistrationId: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationVariableDTO[]> {
    await this.applicationRegistrationLookupService.findOneByIdOrThrow({
      applicationRegistrationId,
      ownerWorkspaceId: workspaceId,
    });

    return this.findVariablesWithObfuscatedValuesGlobal(
      applicationRegistrationId,
    );
  }

  async findVariablesWithObfuscatedValuesGlobal(
    applicationRegistrationId: string,
  ): Promise<ApplicationRegistrationVariableDTO[]> {
    const variables = await this.variableRepository.find({
      where: { applicationRegistrationId },
      order: { key: 'ASC' },
    });

    return Promise.all(variables.map((variable) => this.toDTO(variable)));
  }

  async getEnvVariables(
    applicationRegistrationId: string,
  ): Promise<Record<string, string>> {
    const variables = await this.variableRepository.find({
      where: { applicationRegistrationId },
    });

    const envVariableEntries = await Promise.all(
      variables.map(async (variable) => {
        const plaintextValue = this.decryptValue(variable);

        return [
          variable.key,
          plaintextValue === ''
            ? ''
            : await this.toReadableValue(variable, plaintextValue),
        ] as const;
      }),
    );

    return Object.fromEntries(
      envVariableEntries.filter(([, value]) => value !== ''),
    );
  }

  async updateVariable({
    input,
    workspaceId,
    callingApplication,
  }: {
    input: UpdateApplicationRegistrationVariableInput;
    workspaceId: string;
    callingApplication: FlatApplication | undefined;
  }): Promise<ApplicationRegistrationVariableDTO> {
    const variable = await this.findVariableOrThrow(input.id);

    await this.applicationRegistrationLookupService.findOneByIdOrThrow({
      applicationRegistrationId: variable.applicationRegistrationId,
      ownerWorkspaceId: workspaceId,
    });

    canCallerReachApplicationRegistrationOrThrow({
      callingApplication,
      applicationRegistrationId: variable.applicationRegistrationId,
    });

    return this.toDTO(await this.applyVariableUpdate(variable, input.update));
  }

  async updateVariableGlobal(
    input: UpdateApplicationRegistrationVariableInput,
  ): Promise<ApplicationRegistrationVariableDTO> {
    const variable = await this.findVariableOrThrow(input.id);

    return this.toDTO(await this.applyVariableUpdate(variable, input.update));
  }

  async syncVariableSchemas(
    applicationRegistrationId: string,
    serverVariables: ServerVariables,
    entityManager?: EntityManager,
  ): Promise<void> {
    const variableRepository = isDefined(entityManager)
      ? entityManager.getRepository(ApplicationRegistrationVariableEntity)
      : this.variableRepository;

    const declaredKeys = Object.keys(serverVariables);

    const reservedKeys = findEngineInjectedEnvVariableNames(declaredKeys);

    if (reservedKeys.length > 0) {
      throw new ApplicationRegistrationException(
        `Server variable names are reserved: ${reservedKeys.join(', ')}`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const existingVariables = await variableRepository.find({
      where: { applicationRegistrationId },
    });

    const existingByKey = new Map(
      existingVariables.map((variable) => [variable.key, variable]),
    );

    for (const [key, schema] of Object.entries(serverVariables)) {
      const existing = existingByKey.get(key);
      const isDeprecated = schema.isDeprecated ?? false;
      const isRequired = isDeprecated ? false : (schema.isRequired ?? false);
      const type = schema.type ?? FieldMetadataType.TEXT;

      if (type !== FieldMetadataType.FILES && isDefined(schema.signUrl)) {
        throw new ApplicationRegistrationException(
          `Server variable ${key} declares signUrl, which only applies to FILES variables`,
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
        );
      }

      // The file list is shown in the settings, so a FILES variable is never masked
      const isSecret =
        type === FieldMetadataType.FILES ? false : (schema.isSecret ?? true);
      const schemaColumns = {
        description: schema.description ?? '',
        isSecret,
        isRequired,
        isDeprecated,
        type,
        options: schema.options ?? null,
        signUrl: schema.signUrl ?? false,
      };

      if (!isDefined(existing)) {
        await variableRepository.save(
          variableRepository.create({
            applicationRegistrationId,
            key,
            encryptedValue: this.encryptionService.encryptVersioned(
              '' as PlaintextString,
            ),
            ...schemaColumns,
          }),
        );

        continue;
      }

      // A file list means nothing to another type, and a scalar is no file:
      // a variable crossing the FILES boundary starts over
      const crossesFilesBoundary =
        existing.type !== type &&
        (existing.type === FieldMetadataType.FILES ||
          type === FieldMetadataType.FILES);

      if (crossesFilesBoundary && existing.type === FieldMetadataType.FILES) {
        await this.applicationRegistrationVariableFileService.deleteFilesOfValue(
          {
            applicationRegistrationId,
            plaintextValue: this.decryptValue(existing),
            entityManager,
          },
        );
      }

      await variableRepository.update(existing.id, {
        ...schemaColumns,
        ...(crossesFilesBoundary
          ? {
              encryptedValue: this.encryptionService.encryptVersioned(
                '' as PlaintextString,
              ),
            }
          : {}),
      });
    }

    const removedVariables = existingVariables.filter(
      ({ key }) => !declaredKeys.includes(key),
    );

    for (const removedVariable of removedVariables) {
      if (removedVariable.type === FieldMetadataType.FILES) {
        await this.applicationRegistrationVariableFileService.deleteFilesOfValue(
          {
            applicationRegistrationId,
            plaintextValue: this.decryptValue(removedVariable),
            entityManager,
          },
        );
      }
    }

    if (removedVariables.length > 0) {
      await variableRepository.delete({
        id: In(removedVariables.map(({ id }) => id)),
      });
    }
  }

  async isConfiguredBatch(
    applicationRegistrationIds: string[],
  ): Promise<Map<string, boolean>> {
    const [variables, registrations, installedApps] = await Promise.all([
      this.variableRepository.find({
        where: { applicationRegistrationId: In(applicationRegistrationIds) },
      }),
      this.applicationRegistrationRepository.find({
        where: { id: In(applicationRegistrationIds) },
        select: { id: true, manifest: true, ownerWorkspaceId: true },
      }),
      this.applicationRepository.find({
        where: { applicationRegistrationId: In(applicationRegistrationIds) },
        select: { applicationRegistrationId: true, workspaceId: true },
      }),
    ]);

    const result = new Map<string, boolean>();

    for (const id of applicationRegistrationIds) {
      const registration = registrations.find(
        (registration) => registration.id === id,
      );

      const areVariablesConfigured = variables
        .filter(
          (variable) =>
            variable.applicationRegistrationId === id && variable.isRequired,
        )
        .every((variable) => this.isVariableFilled(variable));

      const isInstalledOnOwnerWorkspace = installedApps.some(
        (app) =>
          app.applicationRegistrationId === id &&
          app.workspaceId === registration?.ownerWorkspaceId,
      );

      result.set(
        id,
        areVariablesConfigured &&
          this.isServerRouteConfigured(
            registration,
            isInstalledOnOwnerWorkspace,
          ),
      );
    }

    return result;
  }

  private isServerRouteConfigured(
    registration: ApplicationRegistrationEntity | undefined,
    isInstalledOnOwnerWorkspace: boolean,
  ): boolean {
    const hasServerRouteFunction =
      registration?.manifest?.logicFunctions?.some((logicFunction) =>
        isDefined(logicFunction.serverRouteTriggerSettings),
      ) ?? false;

    if (!hasServerRouteFunction) {
      return true;
    }

    return (
      isDefined(registration?.ownerWorkspaceId) && isInstalledOnOwnerWorkspace
    );
  }

  private async findVariableOrThrow(
    id: string,
  ): Promise<ApplicationRegistrationVariableEntity> {
    const variable = await this.variableRepository.findOne({
      where: { id },
    });

    if (!variable) {
      throw new ApplicationRegistrationException(
        `Variable with id ${id} not found`,
        ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    return variable;
  }

  private async applyVariableUpdate(
    variable: ApplicationRegistrationVariableEntity,
    update: UpdateApplicationRegistrationVariablePayload,
  ): Promise<ApplicationRegistrationVariableEntity> {
    const nextPlaintextValue =
      update.resetValue === true ? ('' as PlaintextString) : update.value;

    const filesValueUpdate =
      variable.type === FieldMetadataType.FILES && isDefined(nextPlaintextValue)
        ? await this.applicationRegistrationVariableFileService.prepareFilesValueUpdate(
            {
              applicationRegistrationId: variable.applicationRegistrationId,
              previousPlaintextValue: this.decryptValue(variable),
              nextPlaintextValue,
            },
          )
        : undefined;

    const updateData: QueryDeepPartialEntity<ApplicationRegistrationVariableEntity> =
      {};

    if (isDefined(nextPlaintextValue)) {
      updateData.encryptedValue = this.encryptionService.encryptVersioned(
        (filesValueUpdate?.plaintextValueToStore ??
          nextPlaintextValue) as PlaintextString,
      );
    }

    if (isDefined(update.description)) {
      updateData.description = update.description;
    }

    // One transaction keeps the stored file list and the file rows in step
    const droppedFiles = await this.variableRepository.manager.transaction(
      async (entityManager) => {
        const droppedFiles = isDefined(filesValueUpdate)
          ? await this.applicationRegistrationVariableFileService.applyFilesValueUpdate(
              {
                ...filesValueUpdate,
                entityManager,
                applicationRegistrationId: variable.applicationRegistrationId,
              },
            )
          : [];

        if (Object.keys(updateData).length > 0) {
          await entityManager
            .getRepository(ApplicationRegistrationVariableEntity)
            .update(variable.id, updateData);
        }

        return droppedFiles;
      },
    );

    await this.applicationRegistrationVariableFileService.deleteFileBytes(
      droppedFiles,
    );

    return this.variableRepository.findOneOrFail({
      where: { id: variable.id },
    });
  }

  private decryptValue(
    variable: ApplicationRegistrationVariableEntity,
  ): string {
    return this.encryptionService.decryptVersionedOrThrow(
      variable.encryptedValue,
    );
  }

  private isVariableFilled(
    variable: ApplicationRegistrationVariableEntity,
  ): boolean {
    return this.decryptValue(variable) !== '';
  }

  private async toDTO(
    variable: ApplicationRegistrationVariableEntity,
  ): Promise<ApplicationRegistrationVariableDTO> {
    const plaintextValue = this.decryptValue(variable);
    const isFilled = plaintextValue !== '';

    return {
      ...variable,
      isFilled,
      value: !isFilled
        ? null
        : variable.isSecret
          ? '•••••••••••••'
          : await this.toReadableValue(variable, plaintextValue),
    };
  }

  private async toReadableValue(
    variable: Pick<
      ApplicationRegistrationVariableEntity,
      'type' | 'signUrl' | 'applicationRegistrationId'
    >,
    plaintextValue: string,
  ): Promise<string> {
    if (variable.type !== FieldMetadataType.FILES) {
      return plaintextValue;
    }

    return this.applicationRegistrationVariableFileService.signFilesValue({
      plaintextValue,
      applicationRegistrationId: variable.applicationRegistrationId,
      signUrl: variable.signUrl,
    });
  }
}
