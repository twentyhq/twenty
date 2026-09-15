import { isDefined } from 'twenty-shared/utils';

import { USAGE_LIMIT_METER_LABELS } from '@/settings/billing/constants/UsageLimitMeterLabels';
import { USAGE_LIMIT_PERIOD_UNITS } from '@/settings/billing/constants/UsageLimitPeriodUnits';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageLimitMeter } from '@/settings/billing/types/UsageLimitMeter';
import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import { getUsageLimitOperationTypes } from '@/settings/billing/utils/getUsageLimitOperationTypes';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import {
  UsageOperationType,
  type UsageQuotaDefinitionsQuery,
  type UsageResourceType,
} from '~/generated-metadata/graphql';

type UsageLimitDefinitions =
  UsageQuotaDefinitionsQuery['usageQuotaDefinitions'];

type UsageLimitFormOptions = {
  resourceTypes: UsageResourceType[];
  operationTypes: UsageOperationType[];
  spenderTypes: UsageLimitSpenderType[];
  meters: UsageLimitMeter[];
  periodUnits: UsageLimitPeriodUnit[];
};

export const getUsageLimitFormOptions = ({
  definitions,
  values,
}: {
  definitions: UsageLimitDefinitions;
  values: UsageLimitFormValues;
}): UsageLimitFormOptions => {
  const resourceTypes = [
    ...new Set(
      definitions.definitions.map((definition) => definition.resourceType),
    ),
  ];

  const definition = definitions.definitions.find(
    (candidate) => candidate.resourceType === values.resourceType,
  );

  if (!isDefined(definition)) {
    return {
      resourceTypes,
      operationTypes: [],
      spenderTypes: [],
      meters: [],
      periodUnits: [],
    };
  }

  const operationTypes = getUsageLimitOperationTypes(definition);

  const meters = definition.allowedMeters
    .filter((meter) => isKeyOfRecord(USAGE_LIMIT_METER_LABELS, meter))
    .filter(
      (meter) =>
        values.operationType !== UsageOperationType.ALL ||
        meter === 'creditsUsedMicro',
    );

  const periodUnits = USAGE_LIMIT_PERIOD_UNITS.filter(
    (periodUnit) =>
      periodUnit !== 'allowancePeriod' || definitions.hasAllowancePeriod,
  );

  return {
    resourceTypes,
    operationTypes,
    spenderTypes: definition.allowedSpenderTypes.filter((spenderType) =>
      isKeyOfRecord(USAGE_LIMIT_SPENDER_TYPE_LABELS, spenderType),
    ),
    meters,
    periodUnits,
  };
};
