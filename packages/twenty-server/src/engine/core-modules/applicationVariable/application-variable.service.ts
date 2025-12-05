import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';
import { ApplicationVariables } from 'twenty-shared/application';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';

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

  async upsertManyApplicationVariableEntities({
    applicationVariables,
    applicationId,
  }: {
    applicationVariables?: ApplicationVariables;
    applicationId: string;
  }) {
    if (!isDefined(applicationVariables)) {
      return;
    }

    for (const [key, { value, description, isSecret }] of Object.entries(
      applicationVariables,
    )) {
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
            description,
            isSecret,
          },
        );
      } else {
        await this.applicationVariableRepository.save({
          key,
          value,
          description,
          isSecret,
          applicationId,
        });
      }
    }

    await this.applicationVariableRepository.delete({
      applicationId,
      key: Not(In(Object.keys(applicationVariables))),
    });
  }
}
