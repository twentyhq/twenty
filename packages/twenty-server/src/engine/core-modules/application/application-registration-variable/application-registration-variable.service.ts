import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ServerVariables } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, type Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { type CreateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application/application-registration-variable/dtos/create-application-registration-variable.input';
import { type UpdateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application/application-registration-variable/dtos/update-application-registration-variable.input';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

@Injectable()
export class ApplicationRegistrationVariableService {
  constructor(
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly variableRepository: Repository<ApplicationRegistrationVariableEntity>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly encryptionService: SecretEncryptionService,
  ) {}

  async findVariables(
    applicationRegistrationId: string,
    workspaceId: string,
  ): Promise<ApplicationRegistrationVariableEntity[]> {
    await this.assertRegistrationOwnedByWorkspace(
      applicationRegistrationId,
      workspaceId,
    );

    return this.variableRepository.find({
      where: { applicationRegistrationId },
      order: { key: 'ASC' },
    });
  }

  async createVariable(
    input: CreateApplicationRegistrationVariableInput,
    workspaceId: string,
  ): Promise<ApplicationRegistrationVariableEntity> {
    await this.assertRegistrationOwnedByWorkspace(
      input.applicationRegistrationId,
      workspaceId,
    );

    const encryptedValue = this.encryptionService.encrypt(input.value);

    const variable = this.variableRepository.create({
      applicationRegistrationId: input.applicationRegistrationId,
      key: input.key,
      encryptedValue,
      description: input.description ?? '',
      isSecret: input.isSecret ?? true,
    });

    return this.variableRepository.save(variable);
  }

  async updateVariable(
    input: UpdateApplicationRegistrationVariableInput,
    workspaceId: string,
  ): Promise<ApplicationRegistrationVariableEntity> {
    const { id, update } = input;

    const variable = await this.variableRepository.findOne({
      where: { id },
    });

    if (!variable) {
      throw new ApplicationRegistrationException(
        `Variable with id ${id} not found`,
        ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    await this.assertRegistrationOwnedByWorkspace(
      variable.applicationRegistrationId,
      workspaceId,
    );

    const updateData: Record<string, unknown> = {};

    if (isDefined(update.value)) {
      updateData.encryptedValue = this.encryptionService.encrypt(update.value);
    }

    if (isDefined(update.resetValue) && update.resetValue) {
      updateData.encryptedValue = '';
    }

    if (isDefined(update.description)) {
      updateData.description = update.description;
    }

    if (Object.keys(updateData).length > 0) {
      await this.variableRepository.update(id, updateData);
    }

    return this.variableRepository.findOneOrFail({ where: { id } });
  }

  async deleteVariable(id: string, workspaceId: string): Promise<boolean> {
    const variable = await this.variableRepository.findOne({
      where: { id },
    });

    if (!variable) {
      throw new ApplicationRegistrationException(
        `Variable with id ${id} not found`,
        ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    await this.assertRegistrationOwnedByWorkspace(
      variable.applicationRegistrationId,
      workspaceId,
    );

    await this.variableRepository.delete(id);

    return true;
  }

  // Syncs variable schemas from manifest: creates missing, updates metadata, removes stale
  async syncVariableSchemas(
    applicationRegistrationId: string,
    serverVariables: ServerVariables,
  ): Promise<void> {
    const declaredKeys = Object.keys(serverVariables);

    const existingVariables = await this.variableRepository.find({
      where: { applicationRegistrationId },
    });

    const existingByKey = new Map(
      existingVariables.map((variable) => [variable.key, variable]),
    );

    for (const [key, schema] of Object.entries(serverVariables)) {
      const existing = existingByKey.get(key);

      if (existing) {
        await this.variableRepository.update(existing.id, {
          description: schema.description ?? '',
          isSecret: schema.isSecret ?? true,
          isRequired: schema.isRequired ?? false,
        });
      } else {
        await this.variableRepository.save(
          this.variableRepository.create({
            applicationRegistrationId,
            key,
            encryptedValue: '',
            description: schema.description ?? '',
            isSecret: schema.isSecret ?? true,
            isRequired: schema.isRequired ?? false,
          }),
        );
      }
    }

    if (declaredKeys.length > 0) {
      await this.variableRepository.delete({
        applicationRegistrationId,
        key: Not(In(declaredKeys)),
      });
    } else {
      await this.variableRepository.delete({ applicationRegistrationId });
    }
  }

  async isConfiguredBatch(
    applicationRegistrationIds: string[],
  ): Promise<Map<string, boolean>> {
    const variables = await this.variableRepository.find({
      where: { applicationRegistrationId: In(applicationRegistrationIds) },
    });

    const variablesByRegistrationId = new Map<
      string,
      ApplicationRegistrationVariableEntity[]
    >();

    for (const variable of variables) {
      const existing =
        variablesByRegistrationId.get(variable.applicationRegistrationId) ?? [];

      existing.push(variable);
      variablesByRegistrationId.set(
        variable.applicationRegistrationId,
        existing,
      );
    }

    const result = new Map<string, boolean>();

    for (const id of applicationRegistrationIds) {
      const registrationVariables = variablesByRegistrationId.get(id) ?? [];
      const requiredVariables = registrationVariables.filter(
        (v) => v.isRequired,
      );

      result.set(
        id,
        requiredVariables.every((v) => v.isFilled),
      );
    }

    return result;
  }

  private async assertRegistrationOwnedByWorkspace(
    registrationId: string,
    workspaceId: string,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id: registrationId, ownerWorkspaceId: workspaceId },
    });

    if (!registration) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${registrationId} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }
  }
}
