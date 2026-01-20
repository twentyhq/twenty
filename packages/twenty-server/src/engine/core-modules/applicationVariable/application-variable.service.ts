import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';
import { ApplicationVariables } from 'twenty-shared/application';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationVariableEntityService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async update({
    key,
    value,
    applicationId,
    workspaceId,
  }: Pick<ApplicationVariableEntity, 'key' | 'value'> & {
    applicationId: string;
    workspaceId: string;
  }) {
    await this.applicationVariableRepository.update(
      { key, applicationId },
      {
        value,
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

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'applicationVariableMaps',
    ]);
  }
}
