import { OAUTH_SCOPE_ICONS } from '@/auth/constants/OAuthScopeIcons';
import { OAUTH_SCOPE_LABELS } from '@/auth/constants/OAuthScopeLabels';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconDatabase } from 'twenty-ui/icon';

type ApprovedScope = { id: string };

type SettingsBuiltInMcpClientAppPermissionsSectionProps = {
  appName: string;
  authorizations: Pick<BuiltInMcpClientAppAuthorization, 'scopes'>[];
};

export const SettingsBuiltInMcpClientAppPermissionsSection = ({
  appName,
  authorizations,
}: SettingsBuiltInMcpClientAppPermissionsSectionProps) => {
  const { t } = useLingui();

  const approvedScopes: ApprovedScope[] = [
    ...new Set(authorizations.flatMap(({ scopes }) => scopes ?? [])),
  ].map((scope) => ({ id: scope }));

  if (!isNonEmptyArray(approvedScopes)) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Permissions`}
        description={t`What you approved when you connected ${appName}. Your role still limits what it can see and change.`}
      />
      <SettingsListCard
        items={approvedScopes}
        getItemLabel={({ id: scope }) => {
          const scopeLabel = OAUTH_SCOPE_LABELS[scope];

          return isDefined(scopeLabel) ? t(scopeLabel) : scope;
        }}
        RowIconFn={({ id: scope }) => OAUTH_SCOPE_ICONS[scope] ?? IconDatabase}
        RowRightComponent={() => null}
      />
    </Section.Root>
  );
};
