import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const RECORD_LABEL_FIELDS = ['name', 'title', 'subject'];
const RECORD_PREVIEW_COUNT = 3;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isPlainObject(value) && isNonEmptyString(value.id);

const findRecordLabel = (record: Record<string, unknown>) =>
  RECORD_LABEL_FIELDS.map((field) => record[field]).find(isDefined);

const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

const formatDataList = (values: unknown[]) => {
  if (values.length === 0) {
    return '-';
  }

  if (values.every(isRecord)) {
    const labels = values
      .slice(0, RECORD_PREVIEW_COUNT)
      .map((record) => formatDataValue(findRecordLabel(record) ?? record.id));
    const more = values.length > RECORD_PREVIEW_COUNT ? ', …' : '';

    return `${values.length} ${values.length === 1 ? 'record' : 'records'} returned · ${labels.join(', ')}${more}`;
  }

  return values.some((value) => isPlainObject(value) || isArray(value))
    ? JSON.stringify(values)
    : values.map(formatDataValue).join(', ');
};

export const formatDataValue = (value: unknown): string => {
  if (!isDefined(value)) {
    return '-';
  }

  if (isString(value)) {
    return /[\x00-\x1f\x7f-\x9f]/.test(value)
      ? JSON.stringify(value).replace(
          /[\x7f-\x9f]/g,
          (character) =>
            `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
        )
      : value;
  }

  if (isArray(value)) {
    return formatDataList(value);
  }

  if (isPlainObject(value)) {
    if (isNonEmptyString(value.firstName) || isNonEmptyString(value.lastName)) {
      return formatDataValue(
        [value.firstName, value.lastName].filter(isNonEmptyString).join(' '),
      );
    }

    if (isNonEmptyString(value.primaryEmail)) {
      return formatDataValue(value.primaryEmail);
    }

    if (isNonEmptyString(value.primaryLinkUrl)) {
      return formatDataValue(value.primaryLinkUrl);
    }

    const label = isRecord(value) ? findRecordLabel(value) : undefined;

    if (isDefined(label)) {
      return `${formatDataValue(label)} (${formatDataValue(value.id)})`;
    }
  }

  return JSON.stringify(value);
};

export const formatDataCell = (value: unknown) =>
  truncateText(formatDataValue(value), 60);

export const formatDataDetail = (value: unknown) =>
  truncateText(formatDataValue(value), 120);
