import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconButton, useToast } from 'twenty-ui/components';
import {
  IconArrowUp,
  IconChevronDown,
  IconChevronUp,
  IconLock,
  IconMaximize,
  IconMinimize,
  IconTerminal,
  IconX,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { LogConsoleResults } from '@/log-console/components/LogConsoleResults';
import { LOG_CONSOLE_SOURCES } from '@/log-console/constants/LogConsoleSources';
import { useLogConsoleHotKeys } from '@/log-console/hooks/useLogConsoleHotKeys';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  BillingEntitlementKey,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const LOG_CONSOLE_TAB_LIST_INSTANCE_ID = 'log-console-tab-list';

const LOG_CONSOLE_BODY_HEIGHT = 360;

const StyledContainer = styled.div<{ isFullScreen: boolean }>`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  inset: 0;
  position: ${({ isFullScreen }) => (isFullScreen ? 'absolute' : 'relative')};
  z-index: ${RootStackingContextZIndices.LogConsole};

  @media print {
    display: none;
  }
`;

const StyledTabList = styled(TabList)`
  && {
    height: ${themeCssVariables.spacing[12]};
  }
`;

const StyledBarActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledBody = styled.div<{ isFullScreen: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex: ${({ isFullScreen }) => (isFullScreen ? '1' : 'none')};
  flex-direction: column;
  height: ${LOG_CONSOLE_BODY_HEIGHT}px;
  min-height: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledEmptyStateDescription = styled(EmptyState.Description)`
  max-height: none;
`;

const StyledEmptyStateActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const LogConsole = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueToast } = useToast();
  const isMobile = useIsMobile();

  const isLogsSettingsSectionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED,
  );
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentUser = useAtomStateValue(currentUserState);
  const billing = useAtomStateValue(billingState);
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const [logConsoleDisplayMode, setLogConsoleDisplayMode] = useAtomState(
    logConsoleDisplayModeState,
  );
  const [isLogConsoleFullScreen, setIsLogConsoleFullScreen] = useAtomState(
    isLogConsoleFullScreenState,
  );
  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
  );

  const isLogConsoleAllowed =
    isLogsSettingsSectionEnabled &&
    isAdvancedModeEnabled &&
    hasSecurityPermission;

  useLogConsoleHotKeys({ isLogConsoleAllowed });

  if (!isLogConsoleAllowed || isMobile || logConsoleDisplayMode === 'closed') {
    return null;
  }

  const isOpen = logConsoleDisplayMode === 'open';
  const isFullScreen = isOpen && isLogConsoleFullScreen;

  const hasAuditLogsEntitlement =
    currentWorkspace?.billingEntitlements?.some(
      (entitlement) =>
        entitlement.key === BillingEntitlementKey.AUDIT_LOGS &&
        entitlement.value,
    ) === true;

  const isSourceLocked = (source: LogConsoleSource) =>
    source.requiresAuditLogs && !hasAuditLogsEntitlement;

  const sources = [
    ...LOG_CONSOLE_SOURCES.filter((source) => !isSourceLocked(source)),
    ...LOG_CONSOLE_SOURCES.filter(isSourceLocked),
  ];

  const activeSource =
    sources.find((source) => source.id === activeTabId) ?? sources[0];

  const tabs = sources.map((source) => ({
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

  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const canDisplayUpgradeButton =
    isBillingEnabled || currentUser?.canAccessFullAdminPanel === true;
  const upgradeSettingsPath = isBillingEnabled
    ? SettingsPath.BillingPlans
    : SettingsPath.AdminPanelOrganization;

  const openLogConsole = () => {
    if (!isOpen) {
      setLogConsoleDisplayMode('open');
      setIsLogConsoleFullScreen(false);
    }
  };

  const toggleLogConsoleOpen = () => {
    setLogConsoleDisplayMode(isOpen ? 'collapsed' : 'open');
    setIsLogConsoleFullScreen(false);
  };

  const toggleLogConsoleFullScreen = () => {
    setLogConsoleDisplayMode('open');
    setIsLogConsoleFullScreen(!isFullScreen);
  };

  const closeLogConsole = () => {
    setLogConsoleDisplayMode('closed');
    setIsLogConsoleFullScreen(false);
    enqueueToast({
      variant: 'info',
      children: t`Logs console hidden. Press Ctrl + \` to show it again.`,
    });
  };

  const openOrCollapseLabel = isOpen ? t`Collapse` : t`Open`;
  const fullScreenLabel = isFullScreen ? t`Exit full screen` : t`Full screen`;
  const closeLabel = t`Close`;

  const renderActiveSource = () => {
    if (!isClickHouseConfigured) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Title>{t`ClickHouse is not configured`}</EmptyState.Title>
            <StyledEmptyStateDescription>
              {t`Logs require ClickHouse. Please contact your administrator.`}
            </StyledEmptyStateDescription>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    if (isSourceLocked(activeSource)) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Title>
              {t`Audit logs are part of the Organization plan`}
            </EmptyState.Title>
            <StyledEmptyStateDescription>
              {t`Record changes, security events, webhook deliveries, page views and usage need the Organization plan. App logs are available on every plan.`}
            </StyledEmptyStateDescription>
          </EmptyState.Content>
          <StyledEmptyStateActions>
            {canDisplayUpgradeButton && (
              <NavigationButton
                variant="solid"
                color="accent"
                startIcon={<IconArrowUp />}
                to={getSettingsPath(upgradeSettingsPath)}
              >
                {t`Upgrade`}
              </NavigationButton>
            )}
            <Button
              startIcon={<IconTerminal />}
              onClick={() =>
                setActiveTabId('app-logs' satisfies LogConsoleSourceId)
              }
            >
              {t`Open app logs`}
            </Button>
          </StyledEmptyStateActions>
        </EmptyState.Root>
      );
    }

    return <LogConsoleResults source={activeSource} />;
  };

  return (
    <StyledContainer isFullScreen={isFullScreen}>
      <TabListRoot componentInstanceId={LOG_CONSOLE_TAB_LIST_INSTANCE_ID}>
        <StyledTabList
          aria-label={t`Log sources`}
          tabs={tabs}
          behaveAsLinks={false}
          centerTabs
          componentInstanceId={LOG_CONSOLE_TAB_LIST_INSTANCE_ID}
          onClickTab={openLogConsole}
          rightComponent={
            <StyledBarActions>
              <IconButton
                size="sm"
                variant="ghost"
                tooltip={openOrCollapseLabel}
                aria-label={openOrCollapseLabel}
                onClick={toggleLogConsoleOpen}
              >
                {isOpen ? <IconChevronDown /> : <IconChevronUp />}
              </IconButton>
              <IconButton
                size="sm"
                variant="ghost"
                tooltip={fullScreenLabel}
                aria-label={fullScreenLabel}
                onClick={toggleLogConsoleFullScreen}
              >
                {isFullScreen ? <IconMinimize /> : <IconMaximize />}
              </IconButton>
              <IconButton
                size="sm"
                variant="ghost"
                tooltip={closeLabel}
                aria-label={closeLabel}
                onClick={closeLogConsole}
              >
                <IconX />
              </IconButton>
            </StyledBarActions>
          }
        />
        {isOpen && (
          <StyledBody isFullScreen={isFullScreen}>
            {renderActiveSource()}
          </StyledBody>
        )}
      </TabListRoot>
    </StyledContainer>
  );
};
