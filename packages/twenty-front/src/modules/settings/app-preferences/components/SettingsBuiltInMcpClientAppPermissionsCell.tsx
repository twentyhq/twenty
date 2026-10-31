import { OAUTH_SCOPE_LABELS } from '@/auth/constants/OAuthScopeLabels';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

type SettingsBuiltInMcpClientAppPermissionsCellProps = {
  authorization: Pick<BuiltInMcpClientAppAuthorization, 'scopes'>;
};

export const SettingsBuiltInMcpClientAppPermissionsCell = ({
  authorization,
}: SettingsBuiltInMcpClientAppPermissionsCellProps) => {
  const { t } = useLingui();

  const permissionLabels = (authorization.scopes ?? []).map((scope) => {
    const scopeLabel = OAUTH_SCOPE_LABELS[scope];

    return isDefined(scopeLabel) ? t(scopeLabel) : scope;
  });

  return <OverflowingTextWithTooltip text={permissionLabels.join(', ')} />;
};
