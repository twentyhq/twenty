import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isNull } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { type PlanLimitDefaultValuesByConfigVariable } from 'src/engine/core-modules/usage-limit/types/plan-limit-default-values-by-config-variable.type';
import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/stock-limit-default-definition.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { findCandidateLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-candidate-limit-default-values.util';
import { findCreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/utils/find-credit-allowance-provider.util';
import { findAllPlanLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-all-plan-limit-default-values.util';
import { findMalformedPlanLimitDefaultKeys } from 'src/engine/core-modules/usage-limit/utils/find-malformed-plan-limit-default-keys.util';
import { findPlanLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-plan-limit-default-values.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { getLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-limit-default-value.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@Injectable()
export class UsageLimitDefaultsService implements OnModuleInit {
  private readonly logger = new Logger(UsageLimitDefaultsService.name);

  private creditAllowanceProvider: CreditAllowanceProvider;

  private checkedPlanUsageLimitDefaults: Record<
    string,
    PlanUsageLimitDefaults
  > | null = null;

  private checkedSerializedPlanUsageLimitDefaults: string | null = null;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  onModuleInit() {
    this.creditAllowanceProvider = findCreditAllowanceProvider(
      this.discoveryService,
    );
  }

  async findQuotaLimitDefaults({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<QuotaLimitDefault[]> {
    const definitions = this.findQuotaLimitDefaultDefinitions(resourceType);

    const planValues = await this.findPlanValues({
      workspaceId,
      resourceType,
      configVariables: definitions.map(
        ({ limitValueConfigVariable }) => limitValueConfigVariable,
      ),
    });

    return definitions.flatMap(
      ({ limitValueConfigVariable, ...definition }) => {
        const limitValue = this.getLimitValue({
          limitValueConfigVariable,
          planValues,
        });

        return isNull(limitValue) ? [] : [{ ...definition, limitValue }];
      },
    );
  }

  async findStockLimitDefaults({
    workspaceId,
    resourceType,
    operationType,
  }: {
    workspaceId: string;
    resourceType: StockResourceType;
    operationType: UsageOperationType;
  }): Promise<StockLimitDefault[]> {
    const definitions = this.findStockLimitDefaultDefinitions({
      resourceType,
      operationType,
    });

    const planValues = await this.findPlanValues({
      workspaceId,
      resourceType,
      configVariables: definitions.map(
        ({ limitValueConfigVariable }) => limitValueConfigVariable,
      ),
    });

    return definitions.flatMap(
      ({ limitValueConfigVariable, ...definition }) => {
        const limitValue = this.getLimitValue({
          limitValueConfigVariable,
          planValues,
        });

        return isNull(limitValue) ? [] : [{ ...definition, limitValue }];
      },
    );
  }

  // Default counter keys embed the value, so writes that need no billing read cover every value a plan could have keyed them with
  findQuotaLimitDefaultCandidates(
    resourceType: UsageResourceType,
  ): QuotaLimitDefault[] {
    return this.findQuotaLimitDefaultDefinitions(resourceType).flatMap(
      ({ limitValueConfigVariable, ...definition }) =>
        this.findCandidateLimitValues(limitValueConfigVariable).map(
          (limitValue) => ({ ...definition, limitValue }),
        ),
    );
  }

  findStockLimitDefaultCandidates({
    resourceType,
    operationType,
  }: {
    resourceType: StockResourceType;
    operationType: UsageOperationType;
  }): StockLimitDefault[] {
    return this.findStockLimitDefaultDefinitions({
      resourceType,
      operationType,
    }).flatMap(({ limitValueConfigVariable, ...definition }) =>
      this.findCandidateLimitValues(limitValueConfigVariable).map(
        (limitValue) => ({ ...definition, limitValue }),
      ),
    );
  }

  private findQuotaLimitDefaultDefinitions(resourceType: UsageResourceType) {
    return (
      findUsageLimitDefinition({ resourceType, limitKind: 'quota' })
        ?.defaults ?? []
    );
  }

  private findStockLimitDefaultDefinitions({
    resourceType,
    operationType,
  }: {
    resourceType: StockResourceType;
    operationType: UsageOperationType;
  }): StockLimitDefaultDefinition[] {
    return (
      findUsageLimitDefinition({ resourceType, limitKind: 'stock' })
        ?.defaults ?? []
    ).filter((definition) => definition.operationType === operationType);
  }

  private async findPlanValues({
    workspaceId,
    resourceType,
    configVariables,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    configVariables: NumericConfigVariableKey[];
  }): Promise<PlanLimitDefaultValuesByConfigVariable> {
    const plans = this.readPlanUsageLimitDefaults();

    const planSetConfigVariables = new Set(
      findAllPlanLimitDefaultValues(plans)
        .map(({ configVariable }) => configVariable)
        .filter((configVariable) => configVariables.includes(configVariable)),
    );

    if (planSetConfigVariables.size === 0) {
      return new Map();
    }

    try {
      const subscriptionPlan =
        await this.creditAllowanceProvider.getSubscriptionPlan(workspaceId);

      return isDefined(subscriptionPlan)
        ? findPlanLimitDefaultValues({ plans, subscriptionPlan })
        : new Map();
    } catch (error) {
      this.logger.error(
        `Could not read the subscription plan of workspace ${workspaceId}, skipping the usage limit defaults a plan sets: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.UsageLimitPlanDefaultsSkippedOnFailure,
        amount: 1,
        attributes: { resourceType },
      });

      // Skipping is the only fallback that never caps a workspace below what its plan allows
      return new Map(
        [...planSetConfigVariables].map((configVariable) => [
          configVariable,
          null,
        ]),
      );
    }
  }

  private findCandidateLimitValues(
    limitValueConfigVariable: NumericConfigVariableKey,
  ): number[] {
    return findCandidateLimitDefaultValues({
      limitValueConfigVariable,
      plans: this.readPlanUsageLimitDefaults(),
      instanceValue: this.twentyConfigService.get(limitValueConfigVariable),
    });
  }

  private getLimitValue({
    limitValueConfigVariable,
    planValues,
  }: {
    limitValueConfigVariable: NumericConfigVariableKey;
    planValues: PlanLimitDefaultValuesByConfigVariable;
  }): number | null {
    return getLimitDefaultValue({
      limitValueConfigVariable,
      planValues,
      getConfigValue: (key) => this.twentyConfigService.get(key),
    });
  }

  private readPlanUsageLimitDefaults(): Record<string, PlanUsageLimitDefaults> {
    const plans = this.twentyConfigService.get('USAGE_LIMIT_DEFAULTS_BY_PLAN');

    if (plans === this.checkedPlanUsageLimitDefaults) {
      return plans;
    }

    this.checkedPlanUsageLimitDefaults = plans;

    // The database config driver hands back a new object for the same value on every refresh
    const serializedPlans = JSON.stringify(plans);

    if (serializedPlans !== this.checkedSerializedPlanUsageLimitDefaults) {
      this.checkedSerializedPlanUsageLimitDefaults = serializedPlans;
      this.reportMalformedPlanUsageLimitDefaults(plans);
    }

    return plans;
  }

  private reportMalformedPlanUsageLimitDefaults(
    plans: Record<string, PlanUsageLimitDefaults>,
  ): void {
    const malformedKeys = findMalformedPlanLimitDefaultKeys(plans);

    if (!isNonEmptyArray(malformedKeys)) {
      return;
    }

    this.exceptionHandlerService.captureExceptions([
      new Error(
        `Ignored malformed USAGE_LIMIT_DEFAULTS_BY_PLAN entries: ${malformedKeys.join(', ')}`,
      ),
    ]);
  }
}
