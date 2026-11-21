import { OAUTH_SCOPE_LABELS } from '@/applications/constants/OAuthScopeLabels';
import { i18n } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

// Scopes are null on authorizations recorded before scopes were stored; unknown scopes are left out
export const getConnectedAppScopeLabels = (
  scopes: string[] | null | undefined,
): string[] =>
  (scopes ?? [])
    .map((scope) => OAUTH_SCOPE_LABELS[scope])
    .filter(isDefined)
    .map((scopeLabel) => i18n._(scopeLabel));
