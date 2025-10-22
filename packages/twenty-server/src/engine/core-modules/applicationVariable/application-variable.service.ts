import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { EnvManifest } from 'src/engine/core-modules/application/types/application.types';

export class ApplicationVariableEntityService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
  ) {}

  async update({
    key,
    value,
    applicationId,
  }: Pick<ApplicationVariableEntity, 'key' | 'value'> & {
    applicationId: string;
  }) {
    await this.applicationVariableRepository.update(
      { key, applicationId },
      {
        value,
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
      await this.applicationVariableRepository.upsert(
        {
          key,
          value,
          description,
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
