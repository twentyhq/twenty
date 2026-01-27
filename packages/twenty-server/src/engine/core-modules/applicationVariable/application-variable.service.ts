import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ApplicationVariables } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/applicationVariable/application-variable.exception';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/applicationVariable/constants/secret-application-variable-mask.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationVariableEntityService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  private encryptSecretValue(value: string, isSecret: boolean): string {
    if (!isSecret) {
      return value;
    }

    return this.secretEncryptionService.encrypt(value);
  }

  getDisplayValue(applicationVariable: ApplicationVariableEntity): string {
    if (!applicationVariable.isSecret) {
      return applicationVariable.value;
    }

    return this.secretEncryptionService.decryptAndMask({
      value: applicationVariable.value,
      mask: SECRET_APPLICATION_VARIABLE_MASK,
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
    plainTextValue: string;
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

    const encryptedValue = this.encryptSecretValue(
      plainTextValue,
      existingVariable.isSecret,
    );

    await this.applicationVariableRepository.update(
      { key, applicationId },
      {
        value: encryptedValue,
      },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'applicationVariableMaps',
    ]);
  }

  async upsertManyApplicationVariableEntities({
    applicationVariables,
    applicationId,
    workspaceId,
  }: {
    applicationVariables?: ApplicationVariables;
    applicationId: string;
    workspaceId: string;
  }) {
    if (!isDefined(applicationVariables)) {
      return;
    }

    for (const [key, { value, description, isSecret }] of Object.entries(
      applicationVariables,
    )) {
      const isSecretValue = isSecret ?? false;
      const encryptedValue = this.encryptSecretValue(
        value ?? '',
        isSecretValue,
      );

      if (
        await this.applicationVariableRepository.findOne({
          where: {
            key,
            applicationId,
          },
        })
      ) {
        await this.applicationVariableRepository.update(
          {
            key,
            applicationId,
          },
          {
            value: encryptedValue,
            description: description ?? '',
            isSecret: isSecretValue,
          },
        );
      } else {
        await this.applicationVariableRepository.save({
          key,
          value: encryptedValue,
          description: description ?? '',
          isSecret: isSecretValue,
          applicationId,
        });
      }
    }

    await this.applicationVariableRepository.delete({
      applicationId,
      key: Not(In(Object.keys(applicationVariables))),
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'applicationVariableMaps',
    ]);
  }
}
