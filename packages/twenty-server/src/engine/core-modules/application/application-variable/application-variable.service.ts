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

    return this.secretEncryptionService.decryptAndMask({
      value: applicationVariable.value,
      mask: SECRET_APPLICATION_VARIABLE_MASK,
    });
  }

  // Decrypted plaintext value. Server-side only — never expose via GraphQL.
  // Used by trusted server flows that need the raw secret (e.g. exchanging an
  // OAuth client secret with a third-party provider).
  getRawValue(applicationVariable: ApplicationVariableEntity): string {
    if (!applicationVariable.isSecret) {
      return applicationVariable.value;
    }

    return this.secretEncryptionService.decrypt(applicationVariable.value);
  }

  async findOneByKey({
    applicationId,
    key,
  }: {
    applicationId: string;
    key: string;
  }): Promise<ApplicationVariableEntity | null> {
    return this.applicationVariableRepository.findOne({
      where: { applicationId, key },
    });
  }

  async getRawValueByKeyOrThrow({
    applicationId,
    key,
  }: {
    applicationId: string;
    key: string;
  }): Promise<string> {
    const variable = await this.findOneByKey({ applicationId, key });

    if (!isDefined(variable)) {
      throw new ApplicationVariableEntityException(
        `Application variable "${key}" not found for application ${applicationId}`,
        ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
      );
    }

    return this.getRawValue(variable);
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
      ? this.secretEncryptionService.encrypt(plainTextValue)
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
