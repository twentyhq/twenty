import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsUserSearchOption } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';

export type TeamsUserSearchResponse = {
  options: TeamsUserSearchOption[];
  errorMessage: string | undefined;
};

export const FALLBACK_SEARCH_ERROR_MESSAGE =
  'Teams user search failed. Try again.';

const toOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

export const parseTeamsUserSearchResponse = (
  value: unknown,
): TeamsUserSearchResponse => {
  const record =
    isDefined(value) && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : undefined;

  if (!isDefined(record) || record.success !== true) {
    const error = record?.error;

    return {
      options: [],
      errorMessage: isNonEmptyString(error)
        ? error
        : FALLBACK_SEARCH_ERROR_MESSAGE,
    };
  }

  const teamsUsers = Array.isArray(record.teamsUsers) ? record.teamsUsers : [];

  const options: TeamsUserSearchOption[] = [];

  for (const entry of teamsUsers) {
    const entryRecord =
      isDefined(entry) && typeof entry === 'object'
        ? (entry as Record<string, unknown>)
        : undefined;
    const teamsUserAadObjectId = entryRecord?.teamsUserAadObjectId;

    if (!isNonEmptyString(teamsUserAadObjectId)) {
      continue;
    }

    options.push({
      teamsUserAadObjectId,
      displayName: toOptionalString(entryRecord?.displayName),
      email: toOptionalString(entryRecord?.email),
    });
  }

  return { options, errorMessage: undefined };
};
