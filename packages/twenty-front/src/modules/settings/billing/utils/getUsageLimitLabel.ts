import { type MessageDescriptor } from '@lingui/core';

import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';

export const getUsageLimitLabel = (
  labels: Record<string, MessageDescriptor>,
  key: string,
): MessageDescriptor | undefined =>
  isKeyOfRecord(labels, key) ? labels[key] : undefined;
