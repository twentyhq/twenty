import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { validateUsageLimitAgainstDefinition } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-definition.util';

@Injectable()
export class UsageLimitService {
  constructor(
    @InjectWorkspaceScopedRepository(UsageLimitEntity)
    private readonly usageLimitRepository: WorkspaceScopedRepository<UsageLimitEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findAll(workspaceId: string): Promise<UsageLimitEntity[]> {
    return this.usageLimitRepository.find(workspaceId);
  }

  async upsert({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertUsageLimitInput;
  }): Promise<UsageLimitEntity> {
    validateUsageLimitAgainstDefinition(input);

    const scope = {
      resourceType: input.resourceType,
      operationType: input.operationType,
      spenderType: input.spenderType,
      spenderId: input.spenderId ?? '',
      limitKind: input.limitKind,
      windowSeconds: input.windowSeconds,
    };

    await this.usageLimitRepository.upsert(
      workspaceId,
      {
        workspaceId,
        ...scope,
        limitValueType: 'absolute',
        limitValue: input.limitValue,
        burstValue: input.burstValue ?? null,
      },
      { conflictPaths: ['workspaceId', ...Object.keys(scope)] },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimitRules',
    ]);

    return this.usageLimitRepository.findOneOrFail(workspaceId, {
      where: scope,
    });
  }

  async delete({
    workspaceId,
    usageLimitId,
  }: {
    workspaceId: string;
    usageLimitId: string;
  }): Promise<boolean> {
    const { affected } = await this.usageLimitRepository.delete(workspaceId, {
      id: usageLimitId,
    });

    if (!isDefined(affected) || affected === 0) {
      return false;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimitRules',
    ]);

    return true;
  }
}
