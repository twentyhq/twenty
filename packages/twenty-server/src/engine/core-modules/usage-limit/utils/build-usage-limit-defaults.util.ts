import { isDefined } from 'twenty-shared/utils';

import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { SPEED_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';
import { type UsageLimitDefinitions } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { type UsageLimitDefault } from 'src/engine/core-modules/usage-limit/types/usage-limit-default.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const [SPEED_METER] = SPEED_METERS;

export const buildUsageLimitDefaults = ({
  resourceType,
}: {
  resourceType: UsageResourceType;
}): UsageLimitDefault[] => {
  const { speed, stock }: UsageLimitDefinitions =
    USAGE_LIMIT_DEFINITIONS[resourceType];

  const speedDefaults = isDefined(speed)
    ? speed.defaults.flatMap((speedLimitDefault) =>
        speed.allowedOperationTypes.map((operationType) => ({
          resourceType,
          operationType,
          limitKind: 'speed' as const,
          spenderType: speedLimitDefault.spenderType,
          meter: SPEED_METER,
          isOverridable: speedLimitDefault.isOverridable,
          limitValueConfigVariable: speedLimitDefault.limitValueConfigVariable,
          windowMsConfigVariable: speedLimitDefault.windowMsConfigVariable,
          counterScope: speedLimitDefault.counterScope,
        })),
      )
    : [];

  const stockDefaults = isDefined(stock)
    ? stock.defaults.flatMap((stockLimitDefault) =>
        stock.allowedOperationTypes.map((operationType) => ({
          resourceType,
          operationType,
          limitKind: 'stock' as const,
          spenderType: stockLimitDefault.spenderType,
          meter: stockLimitDefault.meter,
          isOverridable: stockLimitDefault.isOverridable,
          limitValueConfigVariable: stockLimitDefault.limitValueConfigVariable,
          windowMsConfigVariable: null,
          counterScope: null,
        })),
      )
    : [];

  return [...speedDefaults, ...stockDefaults];
};
