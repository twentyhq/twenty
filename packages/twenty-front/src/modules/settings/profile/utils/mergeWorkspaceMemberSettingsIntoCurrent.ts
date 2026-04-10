import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';

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

export const mergeWorkspaceMemberSettingsIntoCurrent = (
  previous: CurrentWorkspaceMember,
  update: WorkspaceMemberSettingsUpdateInput | Record<string, unknown>,
): CurrentWorkspaceMember => {
  const payload = update as Record<string, unknown>;
  let next: CurrentWorkspaceMember = { ...previous };

  if (
    'name' in payload &&
    payload.name !== null &&
    typeof payload.name === 'object'
  ) {
    const namePayload = payload.name as Record<string, unknown>;
    next = {
      ...next,
      name: {
        ...previous.name,
        ...(typeof namePayload.firstName === 'string'
          ? { firstName: namePayload.firstName }
          : {}),
        ...(typeof namePayload.lastName === 'string'
          ? { lastName: namePayload.lastName }
          : {}),
      },
    };
  }

  if ('locale' in payload && payload.locale !== undefined) {
    next = { ...next, locale: payload.locale as string | null };
  }

  if ('colorScheme' in payload && payload.colorScheme !== undefined) {
    next = {
      ...next,
      colorScheme: payload.colorScheme as ColorScheme,
    };
  }

  if ('avatarUrl' in payload) {
    const value = payload.avatarUrl;
    next = {
      ...next,
      avatarUrl: value === '' || value === null ? null : (value as string),
    };
  }

  if ('timeZone' in payload && payload.timeZone !== undefined) {
    next = { ...next, timeZone: payload.timeZone as string | null };
  }

  if ('dateFormat' in payload && payload.dateFormat !== undefined) {
    next = {
      ...next,
      dateFormat: payload.dateFormat as CurrentWorkspaceMember['dateFormat'],
    };
  }

  if ('timeFormat' in payload && payload.timeFormat !== undefined) {
    next = {
      ...next,
      timeFormat: payload.timeFormat as CurrentWorkspaceMember['timeFormat'],
    };
  }

  if ('numberFormat' in payload && payload.numberFormat !== undefined) {
    next = {
      ...next,
      numberFormat:
        payload.numberFormat as CurrentWorkspaceMember['numberFormat'],
    };
  }

  if ('calendarStartDay' in payload && payload.calendarStartDay !== undefined) {
    next = {
      ...next,
      calendarStartDay: payload.calendarStartDay as number,
    };
  }

  return next;
};
