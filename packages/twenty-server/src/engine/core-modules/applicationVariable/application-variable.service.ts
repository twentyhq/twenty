import { InjectRepository } from '@nestjs/typeorm';

import { In, Not, Repository } from 'typeorm';

import { ApplicationVariable } from 'src/engine/core-modules/applicationVariable/application-variable.entity';

export class ApplicationVariableService {
  constructor(
    @InjectRepository(ApplicationVariable)
    private readonly applicationVariableRepository: Repository<ApplicationVariable>,
  ) {}

  async update({
    key,
    value,
    applicationId,
  }: Pick<ApplicationVariable, 'key' | 'value'> & { applicationId: string }) {
    await this.applicationVariableRepository.update(
      { key, applicationId },
      {
        value,
      },
    );
  }

  async upsertManyApplicationVariables({
    env,
    applicationId,
  }: {
    env: Record<
      string,
      {
        value?: string;
        description?: string;
        isSecret: boolean;
      }
    >;
    applicationId: string;
  }) {
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
