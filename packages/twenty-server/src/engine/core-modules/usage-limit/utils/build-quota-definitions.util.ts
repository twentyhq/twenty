import { isDefined } from 'twenty-shared/utils';

import { type UsageQuotaDefinitionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definition.dto';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildQuotaDefinitions = (): UsageQuotaDefinitionDTO[] =>
  Object.values(UsageResourceType).flatMap((resourceType) => {
    const limitKind = 'quota';
    const definition = findUsageLimitDefinition({ resourceType, limitKind });

    return isDefined(definition)
      ? [
          {
            resourceType,
            limitKind,
            allowedOperationTypes: definition.allowedOperationTypes,
            allowedSpenderTypes: definition.allowedSpenderTypes,
            allowedMeters: definition.allowedMeters,
          },
        ]
      : [];
  });
