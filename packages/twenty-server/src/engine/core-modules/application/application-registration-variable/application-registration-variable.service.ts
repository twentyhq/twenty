import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ServerVariables } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Not, type EntityManager, type Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationConfigurationIssue } from 'src/engine/core-modules/application/application-registration/enums/application-registration-configuration-issue.enum';
import { getApplicationRegistrationConfigurationIssues } from 'src/engine/core-modules/application/application-registration/utils/get-application-registration-configuration-issues.util';
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
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
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

    await this.applicationRegistrationLookupService.findOneByIdOrThrow({
      applicationRegistrationId: variable.applicationRegistrationId,
      ownerWorkspaceId: workspaceId,
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
    const configurationIssuesByRegistrationId =
      await this.findConfigurationIssuesBatch(applicationRegistrationIds);

    return new Map(
      Array.from(
        configurationIssuesByRegistrationId,
        ([applicationRegistrationId, configurationIssues]) => [
          applicationRegistrationId,
          configurationIssues.length === 0,
        ],
      ),
    );
  }

  async findConfigurationIssuesBatch(
    applicationRegistrationIds: string[],
  ): Promise<Map<string, ApplicationRegistrationConfigurationIssue[]>> {
    if (!isNonEmptyArray(applicationRegistrationIds)) {
      return new Map();
    }

    const [
      requiredVariables,
      ownerWorkspaceIdByRegistrationIdExposingServerRoute,
      registrationIdsInstalledOnOwnerWorkspace,
    ] = await Promise.all([
      this.variableRepository.find({
        where: {
          applicationRegistrationId: In(applicationRegistrationIds),
          isRequired: true,
        },
      }),
      this.findOwnerWorkspaceIdByRegistrationIdExposingServerRoute(
        applicationRegistrationIds,
      ),
      this.findRegistrationIdsInstalledOnOwnerWorkspace(
        applicationRegistrationIds,
      ),
    ]);

    const registrationIdsWithUnfilledRequiredVariable = new Set(
      requiredVariables
        .filter((variable) => !this.isVariableFilled(variable))
        .map((variable) => variable.applicationRegistrationId),
    );

    return new Map(
      applicationRegistrationIds.map((applicationRegistrationId) => [
        applicationRegistrationId,
        getApplicationRegistrationConfigurationIssues({
          hasUnfilledRequiredServerVariable:
            registrationIdsWithUnfilledRequiredVariable.has(
              applicationRegistrationId,
            ),
          exposesServerRoute:
            ownerWorkspaceIdByRegistrationIdExposingServerRoute.has(
              applicationRegistrationId,
            ),
          hasOwnerWorkspace: isDefined(
            ownerWorkspaceIdByRegistrationIdExposingServerRoute.get(
              applicationRegistrationId,
            ),
          ),
          isInstalledOnOwnerWorkspace:
            registrationIdsInstalledOnOwnerWorkspace.has(
              applicationRegistrationId,
            ),
        }),
      ]),
    );
  }

  private async findOwnerWorkspaceIdByRegistrationIdExposingServerRoute(
    applicationRegistrationIds: string[],
  ): Promise<Map<string, string | null>> {
    const rows: { id: string; ownerWorkspaceId: string | null }[] =
      await this.applicationRegistrationRepository
        .createQueryBuilder('registration')
        .select('registration.id', 'id')
        .addSelect('registration.ownerWorkspaceId', 'ownerWorkspaceId')
        .where('registration.id IN (:...applicationRegistrationIds)', {
          applicationRegistrationIds,
        })
        .andWhere(
          `EXISTS (
          SELECT 1
          FROM jsonb_array_elements(
            COALESCE(registration."manifest" -> 'logicFunctions', '[]'::jsonb)
          ) AS logic_function
          WHERE logic_function -> 'serverRouteTriggerSettings' IS NOT NULL
            AND jsonb_typeof(logic_function -> 'serverRouteTriggerSettings') <> 'null'
        )`,
        )
        .getRawMany();

    return new Map(rows.map((row) => [row.id, row.ownerWorkspaceId]));
  }

  private async findRegistrationIdsInstalledOnOwnerWorkspace(
    applicationRegistrationIds: string[],
  ): Promise<Set<string>> {
    const rows: { id: string }[] = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application."applicationRegistrationId"', 'id')
      .innerJoin(
        'application.applicationRegistration',
        'registration',
        'registration."workspaceId" = application."workspaceId"',
      )
      .where(
        'application."applicationRegistrationId" IN (:...applicationRegistrationIds)',
        { applicationRegistrationIds },
      )
      .getRawMany();

    return new Set(rows.map((row) => row.id));
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
}
