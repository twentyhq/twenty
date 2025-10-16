import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

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
    const { id } = await this.applicationVariableRepository.findOneOrFail({
      where: { key, applicationId },
    });

    await this.applicationVariableRepository.update(id, {
      value,
    });
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
    const existingVariables = await this.applicationVariableRepository.find({
      where: { applicationId },
    });

    const variablesToCreate = Object.entries(env).filter(
      ([key, _]) => !existingVariables.map((v) => v.key).includes(key),
    );

    const variablesToUpdate = Object.entries(env).filter(([key, _]) =>
      existingVariables.map((v) => v.key).includes(key),
    );

    const variablesToDelete = existingVariables.filter(
      (existingVariable) => !Object.keys(env).includes(existingVariable.key),
    );

    await this.applicationVariableRepository.delete({
      id: In(variablesToDelete.map((v) => v.id)),
    });

    for (const [key, { value, description, isSecret }] of variablesToCreate) {
      await this.applicationVariableRepository.save({
        key,
        value,
        description,
        isSecret,
        applicationId,
      });
    }

    for (const [key, { value, description, isSecret }] of variablesToUpdate) {
      await this.applicationVariableRepository.update(
        { key, applicationId },
        {
          key,
          value,
          description,
          isSecret,
          applicationId,
        },
      );
    }
  }
}
