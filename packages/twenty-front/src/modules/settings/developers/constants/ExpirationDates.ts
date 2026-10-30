import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { NEVER_EXPIRE_DELTA_IN_YEARS } from '@/settings/developers/constants/NeverExpireDeltaInYears';

export const EXPIRATION_DATES: {
  value: number | null;
  label: MessageDescriptor;
}[] = [
  { label: msg`15 days`, value: 15 },
  { label: msg`30 days`, value: 30 },
  { label: msg`90 days`, value: 90 },
  { label: msg`1 year`, value: 365 },
  { label: msg`2 years`, value: 2 * 365 },
  { label: msg`Never`, value: NEVER_EXPIRE_DELTA_IN_YEARS * 365 },
];
