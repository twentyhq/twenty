import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ServerVariables } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, type EntityManager, type Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { type UpdateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application/application-registration-variable/dtos/update-application-registration-variable.input';
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
  ) {}

  async findVariablesWithObfuscatedValues({
    applicationRegistrationId,
    workspaceId,
  }: {
    applicationRegistrationId: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationVariableDTO[]> {
    await this.assertRegistrationOwnedByWorkspace({
      applicationRegistrationId,
      workspaceId,
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

    return variables.map((variable) => this.toObfuscatedDTO(variable));
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

    await this.assertRegistrationOwnedByWorkspace({
      applicationRegistrationId: variable.applicationRegistrationId,
      workspaceId,
    });

    canCallerReachApplicationRegistrationOrThrow({
      callingApplication,
      applicationRegistrationId: variable.applicationRegistrationId,
    });

    return this.toObfuscatedDTO(await this.applyVariableUpdate(input));
  }

  async updateVariableGlobal(
    input: UpdateApplicationRegistrationVariableInput,
  ): Promise<ApplicationRegistrationVariableDTO> {
    await this.findVariableOrThrow(input.id);

    const entity = await this.applyVariableUpdate(input);

    return this.toObfuscatedDTO(entity);
  }

  // Syncs variable schemas from manifest: creates missing, updates metadata, removes stale
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

      if (existing) {
        await variableRepository.update(existing.id, {
          description: schema.description ?? '',
          isSecret: schema.isSecret ?? true,
          isRequired,
          isDeprecated,
          type: schema.type ?? FieldMetadataType.TEXT,
          options: schema.options ?? null,
        });
      } else {
        await variableRepository.save(
          variableRepository.create({
            applicationRegistrationId,
            key,
            encryptedValue: this.encryptionService.encryptVersioned(
              '' as PlaintextString,
            ),
            description: schema.description ?? '',
            isSecret: schema.isSecret ?? true,
            isRequired,
            isDeprecated,
            type: schema.type ?? FieldMetadataType.TEXT,
            options: schema.options ?? null,
          }),
        );
      }
    }

    if (declaredKeys.length > 0) {
      await variableRepository.delete({
        applicationRegistrationId,
        key: Not(In(declaredKeys)),
      });
    } else {
      await variableRepository.delete({ applicationRegistrationId });
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
    input: UpdateApplicationRegistrationVariableInput,
  ): Promise<ApplicationRegistrationVariableEntity> {
    const { id, update } = input;

    const updateData: Record<string, unknown> = {};

    if (isDefined(update.value)) {
      updateData.encryptedValue = this.encryptionService.encryptVersioned(
        update.value,
      );
    }

    if (isDefined(update.resetValue) && update.resetValue) {
      updateData.encryptedValue = this.encryptionService.encryptVersioned(
        '' as PlaintextString,
      );
    }

    if (isDefined(update.description)) {
      updateData.description = update.description;
    }

    if (Object.keys(updateData).length > 0) {
      await this.variableRepository.update(id, updateData);
    }

    return this.variableRepository.findOneOrFail({ where: { id } });
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

  private toObfuscatedDTO(
    variable: ApplicationRegistrationVariableEntity,
  ): ApplicationRegistrationVariableDTO {
    const plaintextValue = this.decryptValue(variable);
    const isFilled = plaintextValue !== '';

    return {
      ...variable,
      isFilled,
      value: !isFilled
        ? null
        : variable.isSecret
          ? '•••••••••••••'
          : plaintextValue,
    };
  }

  private async assertRegistrationOwnedByWorkspace({
    applicationRegistrationId,
    workspaceId,
  }: {
    applicationRegistrationId: string;
    workspaceId: string;
  }): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id: applicationRegistrationId, ownerWorkspaceId: workspaceId },
    });

    if (!registration) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${applicationRegistrationId} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }
  }
}
