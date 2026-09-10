import { type MessageDescriptor } from '@lingui/core';

export const getUsageLimitLabel = (
  labels: Record<string, MessageDescriptor>,
  key: string,
): MessageDescriptor | undefined => new Map(Object.entries(labels)).get(key);
