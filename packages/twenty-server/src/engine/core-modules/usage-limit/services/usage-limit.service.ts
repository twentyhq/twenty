import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';
import { validateUsageLimitAgainstDefinition } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-definition.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class UsageLimitService {
  constructor(
    @InjectWorkspaceScopedRepository(UsageLimitEntity)
    private readonly usageLimitRepository: WorkspaceScopedRepository<UsageLimitEntity>,
    @InjectWorkspaceScopedRepository(ApiKeyEntity)
    private readonly apiKeyRepository: WorkspaceScopedRepository<ApiKeyEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    @InjectWorkspaceScopedRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: WorkspaceScopedRepository<UserWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
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

    if (
      isIntraWorkspaceScoped(input.spenderType) &&
      !(await this.usageLimitEntitlementService.isIntraWorkspaceLimitEntitled(
        workspaceId,
      ))
    ) {
      throw new UsageLimitException(
        'Intra-workspace usage limits require the Organization plan',
        UsageLimitExceptionCode.LIMIT_NOT_ENTITLED,
      );
    }

    if (isNonEmptyString(input.spenderId)) {
      await this.validateSpenderBelongsToWorkspace({
        workspaceId,
        spenderType: input.spenderType,
        spenderId: input.spenderId,
      });
    }

    const scope = {
      resourceType: input.resourceType,
      operationType: input.operationType,
      spenderType: input.spenderType,
      spenderId: input.spenderId ?? '',
      limitKind: input.limitKind,
      periodCount: input.periodCount,
      periodUnit: input.periodUnit,
      meter: input.meter,
    };

    await this.usageLimitRepository.upsert(
      workspaceId,
      {
        workspaceId,
        ...scope,
        limitValue: input.limitValue,
        burstValue: input.burstValue ?? null,
      },
      { conflictPaths: ['workspaceId', ...Object.keys(scope)] },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    const usageLimit = await this.usageLimitRepository.findOneOrFail(
      workspaceId,
      {
        where: scope,
      },
    );

    await this.usageLimitQuotaService.dropLimitCounter(usageLimit);

    return usageLimit;
  }

  async delete({
    workspaceId,
    usageLimitId,
  }: {
    workspaceId: string;
    usageLimitId: string;
  }): Promise<boolean> {
    const usageLimit = await this.usageLimitRepository.findOne(workspaceId, {
      where: { id: usageLimitId },
    });

    if (!isDefined(usageLimit)) {
      return false;
    }

    const { affected } = await this.usageLimitRepository.delete(workspaceId, {
      id: usageLimitId,
    });

    if (!isDefined(affected) || affected === 0) {
      return false;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    await this.usageLimitQuotaService.dropLimitCounter(usageLimit);

    return true;
  }

  private async validateSpenderBelongsToWorkspace({
    workspaceId,
    spenderType,
    spenderId,
  }: {
    workspaceId: string;
    spenderType: SpenderType;
    spenderId: string;
  }): Promise<void> {
    const spenderExists = await this.spenderExists({
      workspaceId,
      spenderType,
      spenderId,
    });

    if (!spenderExists) {
      throw new UsageLimitException(
        `No ${spenderType} ${spenderId} in this workspace`,
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }
  }

  private async spenderExists({
    workspaceId,
    spenderType,
    spenderId,
  }: {
    workspaceId: string;
    spenderType: SpenderType;
    spenderId: string;
  }): Promise<boolean> {
    switch (spenderType) {
      case 'apiKey':
        return this.apiKeyRepository.existsBy(workspaceId, { id: spenderId });
      case 'application':
        return this.applicationRepository.existsBy(workspaceId, {
          id: spenderId,
        });
      case 'userWorkspace':
        return this.userWorkspaceRepository.existsBy(workspaceId, {
          id: spenderId,
        });
      case 'agent':
        return this.agentRepository.existsBy(workspaceId, { id: spenderId });
      case 'logicFunction':
        return this.logicFunctionRepository.existsBy(workspaceId, {
          id: spenderId,
        });
      default:
        throw new UsageLimitException(
          `A ${spenderType} spender id cannot be checked against the workspace`,
          UsageLimitExceptionCode.LIMIT_INVALID,
        );
    }
  }
}
