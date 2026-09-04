import { type MessageDescriptor } from '@lingui/core';

import { USAGE_OPERATION_TYPE_LABELS } from '@/settings/usage/constants/UsageOperationTypeLabels';

// A Map rather than a direct record index: a source key can name an
// application, and without `noUncheckedIndexedAccess` indexing the record
// would type that miss as a MessageDescriptor instead of undefined.
const LABEL_BY_OPERATION_TYPE: ReadonlyMap<string, MessageDescriptor> = new Map(
  Object.entries(USAGE_OPERATION_TYPE_LABELS),
);

export const getUsageOperationTypeLabel = (
  key: string,
): MessageDescriptor | undefined => LABEL_BY_OPERATION_TYPE.get(key);
