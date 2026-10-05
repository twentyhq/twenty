import { msg } from '@lingui/core/macro';

import { type UsageLimitUnitLabel } from '@/settings/billing/types/UsageLimitUnitLabel';
import { UsageUnit } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_UNIT_LABELS: Record<UsageUnit, UsageLimitUnitLabel> = {
  [UsageUnit.CREDIT]: { name: msg`Credits`, suffix: msg`credits` },
  [UsageUnit.TOKEN]: { name: msg`Tokens`, suffix: msg`tokens` },
  [UsageUnit.INVOCATION]: { name: msg`Operations`, suffix: msg`operations` },
  [UsageUnit.MINUTE]: { name: msg`Minutes`, suffix: msg`min` },
  [UsageUnit.MILLISECOND]: { name: msg`Runtime`, suffix: msg`ms` },
  [UsageUnit.BYTE]: { name: msg`Bytes`, suffix: msg`bytes` },
  [UsageUnit.FILE]: { name: msg`Files`, suffix: msg`files` },
  [UsageUnit.REQUEST]: { name: msg`Requests`, suffix: msg`requests` },
  [UsageUnit.SEAT]: { name: msg`Seats`, suffix: msg`seats` },
  [UsageUnit.RECORD]: { name: msg`Records`, suffix: msg`records` },
  [UsageUnit.COMPLEXITY]: { name: msg`Complexity`, suffix: msg`points` },
  [UsageUnit.ESTIMATED_ROWS_READ]: { name: msg`Rows read`, suffix: msg`rows` },
  [UsageUnit.ESTIMATED_ROWS_WRITTEN]: {
    name: msg`Rows written`,
    suffix: msg`rows`,
  },
  [UsageUnit.ESTIMATED_ROWS_SORTED]: {
    name: msg`Rows sorted`,
    suffix: msg`rows`,
  },
};
