import { isDefined } from 'twenty-shared/utils';

import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { type UsageQuotaDefinitionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definition.dto';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildQuotaDefinitions = (): UsageQuotaDefinitionDTO[] =>
  Object.values(UsageResourceType).flatMap((resourceType) => {
    const { quota } = USAGE_LIMIT_DEFINITIONS[resourceType];

    return isDefined(quota)
      ? [
          {
            resourceType,
            allowedOperationTypes: quota.allowedOperationTypes,
            allowedSpenderTypes: quota.allowedSpenderTypes,
            allowedMeters: quota.allowedMeters,
          },
        ]
      : [];
  });
