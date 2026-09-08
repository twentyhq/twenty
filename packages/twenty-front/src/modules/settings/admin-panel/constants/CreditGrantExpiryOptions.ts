import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Null is the default: credits stay spendable until they are used up. The
// bounded choices exist for deliberately time-boxed handouts, and are days
// rather than a free date because an expiry also caps how long the server may
// cache a workspace's credit balance.
export const CREDIT_GRANT_EXPIRY_OPTIONS: {
  value: number | null;
  label: MessageDescriptor;
}[] = [
  { value: null, label: msg`Never` },
  { value: 30, label: msg`In 30 days` },
  { value: 60, label: msg`In 60 days` },
  { value: 90, label: msg`In 90 days` },
  { value: 180, label: msg`In 180 days` },
  { value: 365, label: msg`In a year` },
];
