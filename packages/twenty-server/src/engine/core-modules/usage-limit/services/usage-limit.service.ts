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
import { UsageLimitStockService } from 'src/engine/core-modules/usage-limit/services/usage-limit-stock.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { assertUsageLimitDefaultOverrideIsAllowed } from 'src/engine/core-modules/usage-limit/utils/assert-usage-limit-default-override-is-allowed.util';
import { assertUsageLimitInstanceOverrideIsAllowed } from 'src/engine/core-modules/usage-limit/utils/assert-usage-limit-instance-override-is-allowed.util';
import {
  buildUsageLimitScope,
  type UsageLimitScope,
} from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';
import { isStockLimit } from 'src/engine/core-modules/usage-limit/utils/is-stock-limit.util';
import { validateUsageLimitAgainstDefinition } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-definition.util';
import { validateUsageLimitAgainstKindRule } from 'src/engine/core-modules/usage-limit/utils/validate-usage-limit-against-kind-rule.util';
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
    private readonly usageLimitStockService: UsageLimitStockService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usagePeriodService: UsagePeriodService,
  ) {}

  async findAll(workspaceId: string): Promise<UsageLimitEntity[]> {
    return this.usageLimitRepository.find(workspaceId);
  }

  async create({
    workspaceId,
    input,
    isOperator,
  }: {
    workspaceId: string;
    input: CreateUsageLimitInput;
    isOperator: boolean;
  }): Promise<UsageLimitEntity> {
    await this.validateInput({ workspaceId, input, isOperator });

    const scope = buildUsageLimitScope(input);

    assertUsageLimitDefaultOverrideIsAllowed({ scope, isOperator });

    await this.assertScopeIsFree({ workspaceId, scope });

    await this.usageLimitRepository.insert(workspaceId, {
      workspaceId,
      ...scope,
      limitValue: input.limitValue,
      burstValue: input.burstValue ?? null,
      isInstanceOverride: isOperator,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    const usageLimit = await this.usageLimitRepository.findOneOrFail(
      workspaceId,
      { where: scope },
    );

    await this.dropCounter(usageLimit);

    return usageLimit;
  }

  async update({
    workspaceId,
    input,
    isOperator,
  }: {
    workspaceId: string;
    input: UpdateUsageLimitInput;
    isOperator: boolean;
  }): Promise<UsageLimitEntity> {
    const usageLimit = await this.usageLimitRepository.findOne(workspaceId, {
      where: { id: input.id },
    });

    if (!isDefined(usageLimit)) {
      throw new UsageLimitException(
        `No usage limit ${input.id} in this workspace`,
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    const authorizedScope = buildUsageLimitScope(usageLimit);

    assertUsageLimitInstanceOverrideIsAllowed({ usageLimit, isOperator });

    // An update rewrites the whole scope, so moving a row off a default is a
    // deletion in disguise and needs the gate the leaving scope would get.
    assertUsageLimitDefaultOverrideIsAllowed({
      scope: authorizedScope,
      isOperator,
    });

    await this.validateInput({ workspaceId, input: input.payload, isOperator });

    const scope = buildUsageLimitScope(input.payload);

    assertUsageLimitDefaultOverrideIsAllowed({ scope, isOperator });

    await this.assertScopeIsFree({
      workspaceId,
      scope,
      allowedUsageLimitId: usageLimit.id,
    });

    const { affected } = await this.usageLimitRepository.update(
      workspaceId,
      { id: usageLimit.id, ...authorizedScope },
      {
        ...scope,
        limitValue: input.payload.limitValue,
        burstValue: input.payload.burstValue ?? null,
        isInstanceOverride: isOperator,
      },
    );

    if (!isDefined(affected) || affected === 0) {
      throw new UsageLimitException(
        `Usage limit ${input.id} changed while this request was being authorized`,
        UsageLimitExceptionCode.LIMIT_CONFLICT,
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    const updatedUsageLimit = await this.usageLimitRepository.findOneOrFail(
      workspaceId,
      { where: { id: usageLimit.id } },
    );

    // counters are keyed by scope and value, so an edit leaves two of them behind
    await this.dropCounter(usageLimit);
    await this.dropCounter(updatedUsageLimit);

    return updatedUsageLimit;
  }

  private async assertScopeIsFree({
    workspaceId,
    scope,
    allowedUsageLimitId,
  }: {
    workspaceId: string;
    scope: UsageLimitScope;
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
    isOperator,
  }: {
    workspaceId: string;
    input: CreateUsageLimitInput;
    isOperator: boolean;
  }): Promise<void> {
    validateUsageLimitAgainstDefinition(input);
    validateUsageLimitAgainstKindRule(input);

    // The entitlement upsells the tenant on their own surface, so it has no say
    // over what an operator sets on someone else's workspace.
    if (
      !isOperator &&
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
    isOperator,
  }: {
    workspaceId: string;
    usageLimitId: string;
    isOperator: boolean;
  }): Promise<boolean> {
    const usageLimit = await this.usageLimitRepository.findOne(workspaceId, {
      where: { id: usageLimitId },
    });

    if (!isDefined(usageLimit)) {
      return false;
    }

    assertUsageLimitInstanceOverrideIsAllowed({ usageLimit, isOperator });

    // Deleting an override hands the scope back to the looser config default.
    assertUsageLimitDefaultOverrideIsAllowed({
      scope: buildUsageLimitScope(usageLimit),
      isOperator,
    });

    const { affected } = await this.usageLimitRepository.delete(workspaceId, {
      id: usageLimitId,
      ...buildUsageLimitScope(usageLimit),
    });

    if (!isDefined(affected) || affected === 0) {
      throw new UsageLimitException(
        `Usage limit ${usageLimitId} changed while this request was being authorized`,
        UsageLimitExceptionCode.LIMIT_CONFLICT,
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'usageLimits',
    ]);

    await this.dropCounter(usageLimit);

    return true;
  }

  private async dropCounter(usageLimit: UsageLimitEntity): Promise<void> {
    if (isStockLimit(usageLimit)) {
      return this.usageLimitStockService.dropStockCounters({
        workspaceId: usageLimit.workspaceId,
        resourceType: usageLimit.resourceType,
        operationType: usageLimit.operationType,
        spenderType: usageLimit.spenderType,
        spenderId: usageLimit.spenderId,
        meter: usageLimit.meter,
        limitValue: usageLimit.limitValue,
      });
    }

    return this.usageLimitQuotaService.dropLimitCounter(usageLimit);
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
