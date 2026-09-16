import { isDefined } from 'twenty-shared/utils';

import { LIMIT_KINDS } from 'src/engine/core-modules/usage-limit/constants/limit-kinds.constant';
import { type UsageQuotaDefinitionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definition.dto';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const isConfigurableLimitKind = (
  limitKind: LimitKind,
): limitKind is Exclude<LimitKind, 'speed'> => limitKind !== 'speed';

const CONFIGURABLE_LIMIT_KINDS = LIMIT_KINDS.filter(isConfigurableLimitKind);

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
              allowedMeters: definition.allowedMeters,
            },
          ]
        : [];
    }),
  );
