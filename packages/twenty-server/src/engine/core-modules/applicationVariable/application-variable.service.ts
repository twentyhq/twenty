import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { EnvManifest } from 'src/engine/core-modules/application/types/application.types';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import {
  ApplicationVariableException,
  ApplicationVariableExceptionCode,
} from 'src/engine/core-modules/applicationVariable/application-variable.exception';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

@Injectable()
export class ApplicationVariableService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  private encryptSecretValue(value: string, isSecret: boolean): string {
    if (!isSecret) {
      return value;
    }

    return this.secretEncryptionService.encrypt(value);
  }

  async update({
    key,
    plainTextValue,
    applicationId,
  }: Pick<ApplicationVariableEntity, 'key'> & {
    applicationId: string;
    plainTextValue: string;
  }) {
    const existingVariable = await this.applicationVariableRepository.findOne({
      where: { key, applicationId },
    });

    if (!isDefined(existingVariable)) {
      throw new ApplicationVariableException(
        `Application variable with key ${key} not found`,
        ApplicationVariableExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
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
  }

  async upsertManyApplicationVariableEntitys({
    env,
    applicationId,
  }: {
    env?: EnvManifest;
    applicationId: string;
  }) {
    if (!isDefined(env)) {
      return;
    }

    for (const [key, { value, description, isSecret }] of Object.entries(env)) {
      const encryptedValue = this.encryptSecretValue(value ?? '', isSecret);

      await this.applicationVariableRepository.upsert(
        {
          key,
          value: encryptedValue,
          description: description ?? '',
          isSecret,
          applicationId,
        },
        { conflictPaths: ['key', 'applicationId'] },
      );
    }

    await this.applicationVariableRepository.delete({
      applicationId,
      key: Not(In(Object.keys(env))),
    });
  }
}
