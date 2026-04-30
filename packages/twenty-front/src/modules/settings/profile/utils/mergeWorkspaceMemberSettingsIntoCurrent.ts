import { isNull, isNumber, isString } from '@sniptt/guards';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberNumberFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated-metadata/graphql';

export type WorkspaceMemberNameUpdate = {
  firstName: string;
  lastName: string;
};

export type WorkspaceMemberSettingsUpdateInput = {
  name?: WorkspaceMemberNameUpdate;
  colorScheme?: string;
  avatarUrl?: string | null;
  locale?: string;
  calendarStartDay?: number;
  timeZone?: string;
  dateFormat?: string;
  timeFormat?: string;
  numberFormat?: string;
  position?: number;
};

const isColorScheme = (value: unknown): value is ColorScheme =>
  value === 'Dark' || value === 'Light' || value === 'System';

const WORKSPACE_MEMBER_DATE_FORMAT_VALUES: ReadonlySet<string> = new Set(
  Object.values(WorkspaceMemberDateFormatEnum),
);

const isWorkspaceMemberDateFormat = (
  value: unknown,
): value is NonNullable<CurrentWorkspaceMember['dateFormat']> =>
  isString(value) && WORKSPACE_MEMBER_DATE_FORMAT_VALUES.has(value);

const WORKSPACE_MEMBER_TIME_FORMAT_VALUES: ReadonlySet<string> = new Set(
  Object.values(WorkspaceMemberTimeFormatEnum),
);

const isWorkspaceMemberTimeFormat = (
  value: unknown,
): value is NonNullable<CurrentWorkspaceMember['timeFormat']> =>
  isString(value) && WORKSPACE_MEMBER_TIME_FORMAT_VALUES.has(value);

const WORKSPACE_MEMBER_NUMBER_FORMAT_VALUES: ReadonlySet<string> = new Set(
  Object.values(WorkspaceMemberNumberFormatEnum),
);

const isWorkspaceMemberNumberFormat = (
  value: unknown,
): value is NonNullable<CurrentWorkspaceMember['numberFormat']> =>
  isString(value) && WORKSPACE_MEMBER_NUMBER_FORMAT_VALUES.has(value);

export const mergeWorkspaceMemberSettingsIntoCurrent = (
  previous: CurrentWorkspaceMember,
  update: WorkspaceMemberSettingsUpdateInput | Record<string, unknown>,
): CurrentWorkspaceMember => {
  if (!isPlainObject(update)) {
    return { ...previous };
  }

  const payload = update;
  let next: CurrentWorkspaceMember = { ...previous };

  if ('name' in payload && isPlainObject(payload.name)) {
    const namePayload = payload.name;
    const firstName = isString(namePayload.firstName)
      ? namePayload.firstName
      : undefined;
    const lastName = isString(namePayload.lastName)
      ? namePayload.lastName
      : undefined;
    next = {
      ...next,
      name: {
        ...previous.name,
        ...(isDefined(firstName) ? { firstName } : {}),
        ...(isDefined(lastName) ? { lastName } : {}),
      },
    };
  }

  if (
    'locale' in payload &&
    (payload.locale === null || isDefined(payload.locale))
  ) {
    if (isString(payload.locale) || isNull(payload.locale)) {
      next = { ...next, locale: payload.locale };
    }
  }

  if ('colorScheme' in payload && isDefined(payload.colorScheme)) {
    if (isColorScheme(payload.colorScheme)) {
      next = { ...next, colorScheme: payload.colorScheme };
    }
  }

  if ('avatarUrl' in payload) {
    const value = payload.avatarUrl;
    if (value === '' || isNull(value)) {
      next = { ...next, avatarUrl: null };
    } else if (isString(value)) {
      next = { ...next, avatarUrl: value };
    }
  }

  if (
    'timeZone' in payload &&
    (isNull(payload.timeZone) || isDefined(payload.timeZone))
  ) {
    if (isString(payload.timeZone) || isNull(payload.timeZone)) {
      next = { ...next, timeZone: payload.timeZone };
    }
  }

  if (
    'dateFormat' in payload &&
    (payload.dateFormat === null || isDefined(payload.dateFormat))
  ) {
    const value = payload.dateFormat;
    if (isNull(value)) {
      next = { ...next, dateFormat: null };
    } else if (isWorkspaceMemberDateFormat(value)) {
      next = { ...next, dateFormat: value };
    }
  }

  if (
    'timeFormat' in payload &&
    (payload.timeFormat === null || isDefined(payload.timeFormat))
  ) {
    const value = payload.timeFormat;
    if (isNull(value)) {
      next = { ...next, timeFormat: null };
    } else if (isWorkspaceMemberTimeFormat(value)) {
      next = { ...next, timeFormat: value };
    }
  }

  if (
    'numberFormat' in payload &&
    (payload.numberFormat === null || isDefined(payload.numberFormat))
  ) {
    const value = payload.numberFormat;
    if (isNull(value)) {
      next = { ...next, numberFormat: null };
    } else if (isWorkspaceMemberNumberFormat(value)) {
      next = { ...next, numberFormat: value };
    }
  }

  if (
    'calendarStartDay' in payload &&
    (isNull(payload.calendarStartDay) || isDefined(payload.calendarStartDay))
  ) {
    const value = payload.calendarStartDay;
    if (isNull(value)) {
      next = { ...next, calendarStartDay: null };
    } else if (isNumber(value) && Number.isFinite(value)) {
      next = { ...next, calendarStartDay: value };
    }
  }

  return next;
};
