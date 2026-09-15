import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Null is the default: credits stay spendable until they are used up. The
// bounded choices exist for deliberately time-boxed handouts. The server rounds
// the chosen day up to the end of the billing period it falls in, because
// credits are only ever spent and settled a period at a time.
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
