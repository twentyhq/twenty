import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Persisted step output schemas store these labels in English, so they are translated when read, never when written
export const WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS: Record<
  string,
  MessageDescriptor
> = {
  'Current Item': msg`Current Item`,
  'Current Item Index': msg`Current Item Index`,
  'Has Processed All Items': msg`Has Processed All Items`,
  Response: msg`Response`,
};
