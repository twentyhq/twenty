import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const STOCK_EXHAUSTED_USER_FRIENDLY_MESSAGES: Record<
  StockResourceType,
  MessageDescriptor
> = {
  [UsageResourceType.STORAGE]: msg`This workspace has reached its storage limit.`,
  [UsageResourceType.RECORD]: msg`This workspace has reached its record limit.`,
};

export const getStockExhaustedUserFriendlyMessage = (
  resourceType: StockResourceType,
): MessageDescriptor => STOCK_EXHAUSTED_USER_FRIENDLY_MESSAGES[resourceType];
