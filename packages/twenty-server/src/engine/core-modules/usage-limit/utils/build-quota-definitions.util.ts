import { isDefined } from 'twenty-shared/utils';

import { type UsageQuotaDefinitionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definition.dto';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type UsageLimitOperationDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-operation-definition.type';
import { findAllowedUsageLimitUnits } from 'src/engine/core-modules/usage-limit/utils/find-allowed-usage-limit-units.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { isBillableOperationType } from 'src/engine/core-modules/usage/utils/is-billable-operation-type.util';

const buildAllowedOperations = ({
  limitKind,
  definition,
}: {
  limitKind: LimitKind;
  definition: { allowedOperations: UsageLimitOperationDefinition[] };
}): UsageLimitOperationDefinition[] =>
  definition.allowedOperations.length >= 2
    ? [
        {
          operationType: UsageOperationType.ALL,
          allowedUnits: findAllowedUsageLimitUnits({
            limitKind,
            definition,
            operationType: UsageOperationType.ALL,
          }),
        },
        ...definition.allowedOperations,
      ]
    : definition.allowedOperations;

export const buildQuotaDefinitions = (): UsageQuotaDefinitionDTO[] =>
  Object.values(UsageResourceType).flatMap((resourceType) => {
    const limitKind = 'quota';
    const definition = findUsageLimitDefinition({ resourceType, limitKind });

    return isDefined(definition)
      ? [
          {
            resourceType,
            limitKind,
            allowedOperations: buildAllowedOperations({
              limitKind,
              definition,
            }),
            allowedSpenderTypes: definition.allowedSpenderTypes,
            // A default on non-billable usage stays out: the workspace must not learn such a limit exists
            operatorOnlyScopes: definition.defaults
              .filter(
                ({ isOverridable, operationType }) =>
                  isOverridable && isBillableOperationType(operationType),
              )
              .map(({ operationType, spenderType, unit, periodUnit }) => ({
                operationType,
                spenderType,
                unit,
                periodUnit,
              })),
          },
        ]
      : [];
  });
