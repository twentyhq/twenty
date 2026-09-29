import { isNonEmptyString, isString } from '@sniptt/guards';
import { isPlainObject, isValidUuid } from 'twenty-shared/utils';

import { type AppPullTarget } from '@/application-build/pull/types';

export const normalizePullTarget = (target: AppPullTarget): AppPullTarget => {
  if (
    !isPlainObject(target) ||
    !isString(target.apiUrl) ||
    !isString(target.workspaceId) ||
    !isValidUuid(target.workspaceId)
  ) {
    throw new Error('Pull requires an API URL and workspace UUID.');
  }

  const apiUrl = new URL(target.apiUrl);

  if (
    !['http:', 'https:'].includes(apiUrl.protocol) ||
    isNonEmptyString(apiUrl.username) ||
    isNonEmptyString(apiUrl.password) ||
    isNonEmptyString(apiUrl.search) ||
    isNonEmptyString(apiUrl.hash)
  ) {
    throw new Error(
      'Pull requires an HTTP API URL without credentials, query or fragment.',
    );
  }

  return {
    apiUrl: apiUrl.toString().replace(/\/+$/, ''),
    workspaceId: target.workspaceId.toLowerCase(),
  };
};
