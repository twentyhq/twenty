import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { type UpdateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/update-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
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
    private readonly usagePeriodService: UsagePeriodService,
  ) {}

  async findAll(workspaceId: string): Promise<UsageLimitEntity[]> {
    return this.usageLimitRepository.find(workspaceId);
  }

  async create({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateUsageLimitInput;
  }): Promise<UsageLimitEntity> {
    await this.validateInput({ workspaceId, input });

    const scope = buildUsageLimitScope(input);

    await this.assertScopeIsFree({ workspaceId, scope });

    await this.usageLimitRepository.insert(workspaceId, {
      workspaceId,
      ...scope,
      limitValue: input.limitValue,
      burstValue: input.burstValue ?? null,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    const usageLimit = await this.usageLimitRepository.findOneOrFail(
      workspaceId,
      { where: scope },
    );

    await this.usageLimitQuotaService.dropLimitCounter(usageLimit);

    return usageLimit;
  }

  async update({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpdateUsageLimitInput;
  }): Promise<UsageLimitEntity> {
    await this.validateInput({ workspaceId, input: input.payload });

    const usageLimit = await this.usageLimitRepository.findOne(workspaceId, {
      where: { id: input.id },
    });

    if (!isDefined(usageLimit)) {
      throw new UsageLimitException(
        `No usage limit ${input.id} in this workspace`,
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    const scope = buildUsageLimitScope(input.payload);

    await this.assertScopeIsFree({
      workspaceId,
      scope,
      allowedUsageLimitId: usageLimit.id,
    });

    await this.usageLimitRepository.update(
      workspaceId,
      { id: usageLimit.id },
      {
        ...scope,
        limitValue: input.payload.limitValue,
        burstValue: input.payload.burstValue ?? null,
      },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    const updatedUsageLimit = await this.usageLimitRepository.findOneOrFail(
      workspaceId,
      { where: { id: usageLimit.id } },
    );

    // counters are keyed by scope, so a scope change leaves two of them to rewarm
    await this.usageLimitQuotaService.dropLimitCounter(usageLimit);
    await this.usageLimitQuotaService.dropLimitCounter(updatedUsageLimit);

    return updatedUsageLimit;
  }

  private async assertScopeIsFree({
    workspaceId,
    scope,
    allowedUsageLimitId,
  }: {
    workspaceId: string;
    scope: ReturnType<typeof buildUsageLimitScope>;
    allowedUsageLimitId?: string;
  }): Promise<void> {
    const usageLimitHoldingScope = await this.usageLimitRepository.findOne(
      workspaceId,
      { where: scope },
    );

    if (
      isDefined(usageLimitHoldingScope) &&
      usageLimitHoldingScope.id !== allowedUsageLimitId
    ) {
      throw new UsageLimitException(
        'Another usage limit already covers this scope',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }
  }

  private async validateInput({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateUsageLimitInput;
  }): Promise<void> {
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

    if (
      input.periodUnit === 'allowancePeriod' &&
      !(await this.usagePeriodService.hasAllowancePeriod(workspaceId))
    ) {
      throw new UsageLimitException(
        'A limit over the allowance period needs a current billing period',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (isNonEmptyString(input.spenderId)) {
      await this.validateSpenderBelongsToWorkspace({
        workspaceId,
        spenderType: input.spenderType,
        spenderId: input.spenderId,
      });
    }
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
