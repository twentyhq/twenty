import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type UsageQuotaScopeInput } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-scope.input';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageQuotaScopeConsumption } from 'src/engine/core-modules/usage-limit/types/usage-quota-scope-consumption.type';
import { type UsageQuotaWithConsumption } from 'src/engine/core-modules/usage-limit/types/usage-quota-with-consumption.type';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { buildCustomQuota } from 'src/engine/core-modules/usage-limit/utils/build-custom-quota.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';
import { groupSpenderIdsByType } from 'src/engine/core-modules/usage-limit/utils/group-spender-ids-by-type.util';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class UsageQuotaConsumptionService {
  private readonly logger = new Logger(UsageQuotaConsumptionService.name);

  constructor(
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
    private readonly usageLimitService: UsageLimitService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
  ) {}

  async findQuotasWithConsumption(
    workspaceId: string,
  ): Promise<UsageQuotaWithConsumption[]> {
    return this.buildCustomQuotas(workspaceId);
  }

  async findConsumptionForScope({
    workspaceId,
    scope,
  }: {
    workspaceId: string;
    scope: UsageQuotaScopeInput;
  }): Promise<UsageQuotaScopeConsumption | null> {
    const periodUnit = scope.periodUnit;

    if (periodUnit === 'second') {
      return null;
    }

    const period = await this.usagePeriodService.findCurrentPeriod({
      workspaceId,
      periodUnit,
    });

    if (!isDefined(period)) {
      return null;
    }

    try {
      const rows = await this.usageAnalyticsService.getConsumptionRows({
        workspaceId,
        resourceType: scope.resourceType,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        periodAnchor: periodUnit === 'allowancePeriod' ? 'billing' : 'calendar',
      });

      return {
        consumedValue: computeQuotaConsumed({
          rows,
          scope: {
            operationType: scope.operationType,
            spenderType: scope.spenderType,
            spenderId: normalizeSpenderId(scope.spenderId ?? ''),
            meter: scope.meter,
          },
        }),
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
      };
    } catch (error) {
      this.logger.error(
        `Could not read the scope consumption for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return {
        consumedValue: null,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
      };
    }
  }

  private async buildCustomQuotas(
    workspaceId: string,
  ): Promise<UsageQuotaWithConsumption[]> {
    const usageLimits = (
      await this.usageLimitService.findAll(workspaceId)
    ).filter((usageLimit) => usageLimit.limitKind === 'quota');

    if (usageLimits.length === 0) {
      return [];
    }

    const enforceableLimits =
      await this.usageLimitEntitlementService.findEnforceableLimits({
        workspaceId,
        limits: usageLimits,
      });

    const enforceableIds = new Set(enforceableLimits.map((limit) => limit.id));

    const [consumptionById, spenderLabelById] = await Promise.all([
      this.usageLimitQuotaService.readLimitConsumptions({
        workspaceId,
        limits: enforceableLimits,
      }),
      this.findSpenderLabels({ workspaceId, usageLimits }),
    ]);

    return usageLimits.map((usageLimit) =>
      buildCustomQuota({
        usageLimit,
        isEnforced: enforceableIds.has(usageLimit.id),
        consumption: consumptionById.get(usageLimit.id),
        spenderLabel: spenderLabelById.get(usageLimit.spenderId) ?? null,
      }),
    );
  }

  private async findSpenderLabels({
    workspaceId,
    usageLimits,
  }: {
    workspaceId: string;
    usageLimits: UsageLimitEntity[];
  }): Promise<Map<string, string>> {
    const idsByType = groupSpenderIdsByType(usageLimits);

    const labelEntries = await Promise.all(
      [...idsByType.entries()].map(([spenderType, ids]) =>
        this.findSpenderLabelsByType({ workspaceId, spenderType, ids }),
      ),
    );

    return new Map(labelEntries.flat());
  }

  private async findSpenderLabelsByType({
    workspaceId,
    spenderType,
    ids,
  }: {
    workspaceId: string;
    spenderType: SpenderType;
    ids: string[];
  }): Promise<[string, string][]> {
    const where = { id: In(ids) };

    switch (spenderType) {
      case 'userWorkspace': {
        const userWorkspaces = await this.userWorkspaceRepository.find(
          workspaceId,
          { where, relations: ['user'] },
        );

        return userWorkspaces.map((userWorkspace) => [
          userWorkspace.id,
          `${userWorkspace.user.firstName} ${userWorkspace.user.lastName}`.trim() ||
            userWorkspace.user.email,
        ]);
      }
      case 'apiKey':
        return (await this.apiKeyRepository.find(workspaceId, { where })).map(
          (apiKey) => [apiKey.id, apiKey.name],
        );
      case 'application':
        return (
          await this.applicationRepository.find(workspaceId, { where })
        ).map((application) => [application.id, application.name]);
      case 'agent':
        return (await this.agentRepository.find(workspaceId, { where })).map(
          (agent) => [agent.id, agent.label],
        );
      case 'logicFunction':
        return (
          await this.logicFunctionRepository.find(workspaceId, { where })
        ).map((logicFunction) => [logicFunction.id, logicFunction.name]);
      default:
        return [];
    }
  }
}
