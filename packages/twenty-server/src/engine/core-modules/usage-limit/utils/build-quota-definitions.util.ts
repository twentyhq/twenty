import { isDefined } from 'twenty-shared/utils';

import { LIMIT_KINDS } from 'src/engine/core-modules/usage-limit/constants/limit-kinds.constant';
import { type UsageQuotaDefinitionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definition.dto';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const CONFIGURABLE_LIMIT_KINDS = LIMIT_KINDS.filter(
  (limitKind) => limitKind !== 'speed',
);

export const buildQuotaDefinitions = (): UsageQuotaDefinitionDTO[] =>
  Object.values(UsageResourceType).flatMap((resourceType) =>
    CONFIGURABLE_LIMIT_KINDS.flatMap((limitKind) => {
      const definition = findUsageLimitDefinition({ resourceType, limitKind });

      return isDefined(definition)
        ? [
            {
              resourceType,
              limitKind,
              allowedOperationTypes: definition.allowedOperationTypes,
              allowedSpenderTypes: definition.allowedSpenderTypes,
              allowedMeters: definition.allowedMeters as UsageMeter[],
            },
          ]
        : [];
    }),
  );
