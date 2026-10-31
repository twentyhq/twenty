import { OAUTH_SCOPE_LABELS } from '@/auth/constants/OAuthScopeLabels';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type ApplicationAuthorization } from '~/generated-metadata/graphql';

type SettingsApplicationAuthorizationPermissionsCellProps = {
  authorization: Pick<ApplicationAuthorization, 'scopes'>;
};

export const SettingsApplicationAuthorizationPermissionsCell = ({
  authorization,
}: SettingsApplicationAuthorizationPermissionsCellProps) => {
  const { t } = useLingui();

  const permissionLabels = (authorization.scopes ?? []).map((scope) => {
    const scopeLabel = OAUTH_SCOPE_LABELS[scope];

    return isDefined(scopeLabel) ? t(scopeLabel) : scope;
  });

  return <OverflowingTextWithTooltip text={permissionLabels.join(', ')} />;
};
