import { isDefined } from 'twenty-shared/utils';

import { ANCHORED_USAGE_LIMIT_PERIOD_UNITS } from '@/settings/billing/constants/AnchoredUsageLimitPeriodUnits';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import {
  UsageOperationType,
  type UsageQuotaDefinitionsQuery,
  type UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';

type UsageLimitDefinitions =
  UsageQuotaDefinitionsQuery['usageQuotaDefinitions'];

type UsageLimitFormOptions = {
  resourceTypes: UsageResourceType[];
  operationTypes: UsageOperationType[];
  spenderTypes: UsageLimitSpenderType[];
  units: UsageUnit[];
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
      units: [],
      periodUnits: [],
    };
  }

  const operationTypes = definition.allowedOperations.map(
    (allowedOperation) => allowedOperation.operationType,
  );

  const units =
    definition.allowedOperations.find(
      (allowedOperation) =>
        allowedOperation.operationType === values.operationType,
    )?.allowedUnits ??
    (values.operationType === UsageOperationType.ALL ? [UsageUnit.CREDIT] : []);

  const periodUnits = ANCHORED_USAGE_LIMIT_PERIOD_UNITS.filter(
    (periodUnit) =>
      periodUnit !== 'allowancePeriod' || definitions.hasAllowancePeriod,
  );

  return {
    resourceTypes,
    operationTypes,
    spenderTypes: definition.allowedSpenderTypes.filter((spenderType) =>
      isKeyOfRecord(USAGE_LIMIT_SPENDER_TYPE_LABELS, spenderType),
    ),
    units,
    periodUnits,
  };
};
