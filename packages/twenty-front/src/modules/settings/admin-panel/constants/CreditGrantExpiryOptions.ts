import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Null (default) keeps credits until used up; the server rounds a chosen day up to its billing period end, as credits settle per period.
export const CREDIT_GRANT_EXPIRY_OPTIONS: {
  value: number | null;
  label: MessageDescriptor;
}[] = [
  { value: null, label: msg`Never` },
  { value: 30, label: msg`After 30 days` },
  { value: 60, label: msg`After 60 days` },
  { value: 90, label: msg`After 90 days` },
  { value: 180, label: msg`After 180 days` },
  { value: 365, label: msg`After a year` },
];
