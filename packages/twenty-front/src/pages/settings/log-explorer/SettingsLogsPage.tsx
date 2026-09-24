import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Navigate, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconDatabase, IconLock } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsLogsLockedPlaceholder } from '@/settings/log-explorer/components/SettingsLogsLockedPlaceholder';
import { SettingsLogsPlaceholder } from '@/settings/log-explorer/components/SettingsLogsPlaceholder';
import { SettingsLogsResults } from '@/settings/log-explorer/components/SettingsLogsResults';
import { SETTINGS_LOGS_SOURCES } from '@/settings/log-explorer/constants/SettingsLogsSources';
import { type SettingsLogsSource } from '@/settings/log-explorer/types/SettingsLogsSource';
import { type SettingsLogsSourceId } from '@/settings/log-explorer/types/SettingsLogsSourceId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

const SETTINGS_LOGS_TABS_INSTANCE_ID = 'settings-logs-tabs';

const StyledSourceContent = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

export const SettingsLogsPage = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const location = useLocation();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const hasAuditLogsEntitlement =
    currentWorkspace?.billingEntitlements?.some(
      (entitlement) =>
        entitlement.key === BillingEntitlementKey.AUDIT_LOGS &&
        entitlement.value,
    ) === true;

  const isSourceLocked = (source: SettingsLogsSource) =>
    source.requiresAuditLogs && !hasAuditLogsEntitlement;

  const tabs = SETTINGS_LOGS_SOURCES.map((source) => ({
    id: source.id,
    title: t(source.label),
    Icon: source.Icon,
    pill: isSourceLocked(source) ? (
      <IconLock
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={theme.font.color.tertiary}
      />
    ) : undefined,
  }));

  const activeSourceId = useSettingsActiveTabId(
    SETTINGS_LOGS_TABS_INSTANCE_ID,
    tabs.map((tab) => tab.id),
  );

  const activeSource =
    SETTINGS_LOGS_SOURCES.find((source) => source.id === activeSourceId) ??
    SETTINGS_LOGS_SOURCES[0];

  if (!hasAuditLogsEntitlement && !isNonEmptyString(location.hash)) {
    return (
      <Navigate
        replace
        to={{
          search: location.search,
          hash: 'app-logs' satisfies SettingsLogsSourceId,
        }}
      />
    );
  }

  const renderActiveSource = () => {
    if (isSourceLocked(activeSource)) {
      return <SettingsLogsLockedPlaceholder />;
    }

    if (!isClickHouseConfigured) {
      return (
        <SettingsLogsPlaceholder
          Icon={IconDatabase}
          title={t`ClickHouse is not configured`}
          description={t`Logs require ClickHouse. Please contact your administrator.`}
        />
      );
    }

    return <SettingsLogsResults source={activeSource} />;
  };

  return (
    <SettingsPageLayout
      title={t`Logs`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Logs` },
      ]}
      secondaryBar={
        <TabList
          aria-label={t`Log sources`}
          tabs={tabs}
          componentInstanceId={SETTINGS_LOGS_TABS_INSTANCE_ID}
        />
      }
    >
      <StyledSourceContent>{renderActiveSource()}</StyledSourceContent>
    </SettingsPageLayout>
  );
};
