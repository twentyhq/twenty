import {
  IconAddressBook,
  IconClock,
  IconCoins,
  type IconComponent,
  IconDatabase,
  IconFiles,
  IconNumber123,
  IconUsers,
} from 'twenty-ui/icon';

import { UsageUnit } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_UNIT_ICONS: Record<UsageUnit, IconComponent> = {
  [UsageUnit.CREDIT]: IconCoins,
  [UsageUnit.TOKEN]: IconNumber123,
  [UsageUnit.INVOCATION]: IconNumber123,
  [UsageUnit.MINUTE]: IconClock,
  [UsageUnit.MILLISECOND]: IconClock,
  [UsageUnit.BYTE]: IconDatabase,
  [UsageUnit.FILE]: IconFiles,
  [UsageUnit.REQUEST]: IconNumber123,
  [UsageUnit.SEAT]: IconUsers,
  [UsageUnit.RECORD]: IconAddressBook,
  [UsageUnit.COMPLEXITY]: IconNumber123,
  [UsageUnit.ESTIMATED_ROWS_READ]: IconDatabase,
};
