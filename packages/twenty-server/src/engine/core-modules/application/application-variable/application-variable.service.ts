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
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { isNonEmptyString } from '@sniptt/guards';

@Injectable()
export class ApplicationVariableEntityService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  getDisplayValue(applicationVariable: ApplicationVariableEntity): string {
    if (!applicationVariable.isSecret) {
      return applicationVariable.value;
    }

    if (!isNonEmptyString(applicationVariable.value)) {
      return '';
    }

    return this.secretEncryptionService.decryptAndMaskVersioned({
      value: applicationVariable.value,
      mask: SECRET_APPLICATION_VARIABLE_MASK,
      workspaceId: applicationVariable.workspaceId,
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

    const encryptedValue = existingVariable.isSecret
      ? this.secretEncryptionService.encryptVersioned(plainTextValue, {
          workspaceId,
        })
      : plainTextValue;

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
}
