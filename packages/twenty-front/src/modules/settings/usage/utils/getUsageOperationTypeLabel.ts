import { type MessageDescriptor } from '@lingui/core';

import { USAGE_OPERATION_TYPE_LABELS } from '@/settings/usage/constants/UsageOperationTypeLabels';

// A Map, not a record index: keys can name an application, and without noUncheckedIndexedAccess a miss would not type as undefined
const LABEL_BY_OPERATION_TYPE: ReadonlyMap<string, MessageDescriptor> = new Map(
  Object.entries(USAGE_OPERATION_TYPE_LABELS),
);

export const getUsageOperationTypeLabel = (
  key: string,
): MessageDescriptor | undefined => LABEL_BY_OPERATION_TYPE.get(key);
