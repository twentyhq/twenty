import { types } from 'node:util';

import {
  isArray,
  isBigInt,
  isBoolean,
  isNumber,
  isObject,
  isString,
} from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type MontyDateMarker = {
  __monty_type__: 'Date';
  year: number;
  month: number;
  day: number;
};

type MontyDateTimeMarker = {
  __monty_type__: 'DateTime';
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  microsecond: number;
  offsetSeconds?: number;
};

const pad = (value: number, length = 2) =>
  String(Math.abs(value)).padStart(length, '0');

const formatDate = ({ year, month, day }: MontyDateMarker) =>
  `${pad(year, 4)}-${pad(month)}-${pad(day)}`;

const formatOffset = (offsetSeconds: number | undefined) => {
  if (!isDefined(offsetSeconds)) {
    return '';
  }

  if (offsetSeconds === 0) {
    return 'Z';
  }

  const sign = offsetSeconds < 0 ? '-' : '+';
  const absoluteMinutes = Math.floor(Math.abs(offsetSeconds) / 60);

  return `${sign}${pad(Math.floor(absoluteMinutes / 60))}:${pad(absoluteMinutes % 60)}`;
};

const formatDateTime = (dateTime: MontyDateTimeMarker) =>
  `${formatDate({ ...dateTime, __monty_type__: 'Date' })}T${pad(dateTime.hour)}:${pad(dateTime.minute)}:${pad(dateTime.second)}` +
  `${dateTime.microsecond > 0 ? `.${pad(dateTime.microsecond, 6)}` : ''}${formatOffset(dateTime.offsetSeconds)}`;

const hasMontyType = (value: object, montyType: string): boolean =>
  '__monty_type__' in value && value.__monty_type__ === montyType;

// Python dicts arrive as Maps, sets as Sets and big ints as bigints, none of which JSON.stringify keeps.
// util.types checks, unlike instanceof, hold when the value comes from another realm (jest)
export const convertMontyValueToJson = (value: unknown): unknown => {
  if (!isDefined(value)) {
    return null;
  }

  if (isBigInt(value)) {
    return Number.isSafeInteger(Number(value))
      ? Number(value)
      : value.toString();
  }

  if (isString(value) || isNumber(value) || isBoolean(value)) {
    return value;
  }

  if (isArray(value) || types.isSet(value)) {
    return [...value].map(convertMontyValueToJson);
  }

  if (types.isMap(value)) {
    return Object.fromEntries(
      [...value.entries()].map(([key, entryValue]) => [
        String(key),
        convertMontyValueToJson(entryValue),
      ]),
    );
  }

  if (isObject(value)) {
    if (hasMontyType(value, 'Date')) {
      return formatDate(value as MontyDateMarker);
    }

    if (hasMontyType(value, 'DateTime')) {
      return formatDateTime(value as MontyDateTimeMarker);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        convertMontyValueToJson(entryValue),
      ]),
    );
  }

  return String(value);
};
