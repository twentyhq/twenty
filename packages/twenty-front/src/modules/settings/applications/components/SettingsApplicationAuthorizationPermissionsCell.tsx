import { OAUTH_SCOPE_LABELS } from '@/auth/constants/OAuthScopeLabels';
import { getApplicationAuthorizationsScopes } from '@/settings/applications/utils/getApplicationAuthorizationsScopes';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type ApplicationAuthorization } from '~/generated-metadata/graphql';

type SettingsApplicationAuthorizationPermissionsCellProps = {
  authorizations: Pick<ApplicationAuthorization, 'scopes'>[];
};

export const SettingsApplicationAuthorizationPermissionsCell = ({
  authorizations,
}: SettingsApplicationAuthorizationPermissionsCellProps) => {
  const { t } = useLingui();

  const { scopes, hasUnrecordedScopes } =
    getApplicationAuthorizationsScopes(authorizations);

  const permissionLabels = scopes.map((scope) => {
    const scopeLabel = OAUTH_SCOPE_LABELS[scope];

    return isDefined(scopeLabel) ? t(scopeLabel) : scope;
  });

  if (hasUnrecordedScopes) {
    permissionLabels.push(t`Unknown permissions`);
  }

  return <OverflowingTextWithTooltip text={permissionLabels.join(', ')} />;
};
