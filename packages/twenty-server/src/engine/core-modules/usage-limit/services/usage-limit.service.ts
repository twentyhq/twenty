import { Injectable } from '@nestjs/common';

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

    await this.usageLimitRepository.upsert(
      workspaceId,
      {
        workspaceId,
        resourceType: input.resourceType,
        operationType: input.operationType,
        spenderType: input.spenderType,
        spenderId: input.spenderId ?? '',
        limitKind: input.limitKind,
        windowSeconds: input.windowSeconds,
        limitType: 'absolute',
        limitValue: input.limitValue,
        burstValue: input.burstValue ?? null,
      },
      {
        conflictPaths: [
          'workspaceId',
          'resourceType',
          'operationType',
          'spenderType',
          'spenderId',
          'limitKind',
          'windowSeconds',
        ],
      },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimitRules',
    ]);

    const [usageLimit] = await this.usageLimitRepository.find(workspaceId, {
      where: {
        resourceType: input.resourceType,
        operationType: input.operationType,
        spenderType: input.spenderType,
        spenderId: input.spenderId ?? '',
        limitKind: input.limitKind,
        windowSeconds: input.windowSeconds,
      },
    });

    return usageLimit;
  }

  async delete({
    workspaceId,
    usageLimitId,
  }: {
    workspaceId: string;
    usageLimitId: string;
  }): Promise<boolean> {
    await this.usageLimitRepository.delete(workspaceId, { id: usageLimitId });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimitRules',
    ]);

    return true;
  }
}
