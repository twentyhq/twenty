import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationVariable } from 'src/engine/core-modules/applicationVariable/application-variable.entity';

export class ApplicationVariableService {
  constructor(
    @InjectRepository(ApplicationVariable)
    private readonly applicationVariableRepository: Repository<ApplicationVariable>,
  ) {}

  async upsertManyApplicationVariables({
    env,
    applicationId,
  }: {
    env: Record<
      string,
      {
        key: string;
        value?: string;
        description?: string;
        isSecret: boolean;
      }
    >;
    applicationId: string;
  }) {
    await this.applicationVariableRepository.delete({
      applicationId,
    });

    for (const [key, { value, description, isSecret }] of Object.entries(env)) {
      await this.applicationVariableRepository.save({
        key,
        value,
        description,
        isSecret,
        applicationId,
      });
    }
  }
}
