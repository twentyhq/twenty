import { CONNECTED_APP_SCOPE_LABELS } from '@/settings/profile/connected-apps/constants/ConnectedAppScopeLabels';
import { i18n } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

// Scopes are null on authorizations recorded before scopes were stored; unknown scopes are left out
export const getConnectedAppScopeLabels = (
  scopes: string[] | null | undefined,
): string[] =>
  (scopes ?? [])
    .map((scope) => CONNECTED_APP_SCOPE_LABELS[scope])
    .filter(isDefined)
    .map((scopeLabel) => i18n._(scopeLabel));
