import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type FilterableFieldType } from 'twenty-shared/types';

const DASHBOARD_FILTER_TYPE_LABELS: Record<
  FilterableFieldType,
  MessageDescriptor
> = {
  TEXT: msg`Text`,
  PHONES: msg`Phones`,
  EMAILS: msg`Emails`,
  DATE_TIME: msg`Date and time`,
  DATE: msg`Date`,
  NUMBER: msg`Number`,
  CURRENCY: msg`Currency`,
  FULL_NAME: msg`Full name`,
  LINKS: msg`Links`,
  RELATION: msg`Relation`,
  ADDRESS: msg`Address`,
  SELECT: msg`Select`,
  RATING: msg`Rating`,
  MULTI_SELECT: msg`Multi-select`,
  ACTOR: msg`Actor`,
  ARRAY: msg`Array`,
  RAW_JSON: msg`JSON`,
  FILES: msg`Files`,
  BOOLEAN: msg`Boolean`,
  UUID: msg`Unique ID`,
};

// Translated at render time with useLingui so the label follows the active locale.
export const getDashboardFilterTypeLabel = (
  filterType: FilterableFieldType,
): MessageDescriptor => DASHBOARD_FILTER_TYPE_LABELS[filterType];
