import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useSyncExternalStore } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, LightIconButton, useToast } from 'twenty-ui/components';
import {
  IconChevronDown,
  IconChevronUp,
  IconLock,
  IconMaximize,
  IconMinimize,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { getOsControlSymbol } from 'twenty-ui/utilities';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { LogConsoleDetailPanel } from '@/log-console/components/LogConsoleDetailPanel';
import { LogConsoleResults } from '@/log-console/components/LogConsoleResults';
import { LOG_CONSOLE_HEIGHT_CONSTRAINTS } from '@/log-console/constants/LogConsoleHeightConstraints';
import { LOG_CONSOLE_NARROW_BODY_MAX_WIDTH } from '@/log-console/constants/LogConsoleNarrowBodyMaxWidth';
import { LOG_CONSOLE_SOURCES } from '@/log-console/constants/LogConsoleSources';
import { LOG_CONSOLE_TAB_LIST_INSTANCE_ID } from '@/log-console/constants/LogConsoleTabListInstanceId';
import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { logConsoleSearchState } from '@/log-console/states/logConsoleSearchState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { SETTINGS_CONTENT_MAX_WIDTH } from '@/settings/constants/SettingsContentMaxWidth';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { ResizablePanelEdge } from '@/ui/layout/resizable-panel/components/ResizablePanelEdge';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { TAB_LIST_ROW_HEIGHT_CSS_VARIABLE } from '@/ui/layout/tab-list/constants/TabListRowHeightCssVariable';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { getUiZoom } from '@/ui/theme/utils/getUiZoom';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

const LOG_CONSOLE_HEIGHT_CSS_VARIABLE = '--log-console-height';

const LOG_CONSOLE_MIN_PAGE_HEIGHT = 120;

const StyledContainer = styled.div<{ isFullScreen: boolean }>`
  ${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE}: ${({ isFullScreen }) =>
    isFullScreen ? `${APP_HEADER_HEIGHT}px` : TAB_LIST_HEIGHT};

  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-top: ${({ isFullScreen }) =>
    isFullScreen
      ? 'none'
      : `1px solid ${themeCssVariables.border.color.medium}`};
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
    background-color: ${themeCssVariables.background.secondary};
    height: var(${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE});
    padding-left: ${themeCssVariables.spacing[2]};
  }

  &&::after {
    background-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledBarActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[3]};
`;

const StyledBody = styled.div<{ bodyHeight: number; isFullScreen: boolean }>`
  container-name: log-console-body;
  container-type: inline-size;
  display: flex;
  flex: ${({ isFullScreen }) => (isFullScreen ? '1' : 'none')};
  height: var(
    ${LOG_CONSOLE_HEIGHT_CSS_VARIABLE},
    ${({ bodyHeight }) => bodyHeight}px
  );
  min-height: ${LOG_CONSOLE_HEIGHT_CONSTRAINTS.min}px;
  position: relative;
`;

const StyledActiveSource = styled.div<{ isDetailPanelOpen: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  @container log-console-body (max-width: ${LOG_CONSOLE_NARROW_BODY_MAX_WIDTH}px) {
    visibility: ${({ isDetailPanelOpen }) =>
      isDetailPanelOpen ? 'hidden' : 'visible'};
  }
`;

const subscribeToWindowResize = (onWindowResize: () => void) => {
  window.addEventListener('resize', onWindowResize);

  return () => window.removeEventListener('resize', onWindowResize);
};

const getWindowHeight = () => window.innerHeight;

const StyledUpgradeCardContainer = styled.div`
  box-sizing: border-box;
  margin: auto;
  max-width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
  padding: 0 ${themeCssVariables.spacing[8]};
  width: 100%;
`;

export const LogConsole = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueToast } = useToast();

  const isLogConsoleAllowed = useIsLogConsoleAllowed();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const [logConsoleDisplayMode, setLogConsoleDisplayMode] = useAtomState(
    logConsoleDisplayModeState,
  );
  const [isLogConsoleFullScreen, setIsLogConsoleFullScreen] = useAtomState(
    isLogConsoleFullScreenState,
  );
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
  );
  const [logConsoleHeight, setLogConsoleHeight] = useAtomState(
    logConsoleHeightState,
  );
  const setLogConsoleFilters = useSetAtomState(logConsoleFiltersState);
  const setLogConsoleSearch = useSetAtomState(logConsoleSearchState);
  const [logConsoleSelectedLog, setLogConsoleSelectedLog] = useAtomState(
    logConsoleSelectedLogState,
  );
  const windowHeight = useSyncExternalStore(
    subscribeToWindowResize,
    getWindowHeight,
  );

  const appHeight = windowHeight / getUiZoom();
  const logConsoleResizeConstraints = {
    min: 0,
    max: appHeight - APP_HEADER_HEIGHT - LOG_CONSOLE_MIN_PAGE_HEIGHT,
    default: appHeight / 2,
  };
  const logConsoleBodyHeight = Math.min(
    logConsoleHeight ?? logConsoleResizeConstraints.default,
    logConsoleResizeConstraints.max,
  );

  if (!isLogConsoleAllowed || logConsoleDisplayMode === 'closed') {
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

  const openLogConsole = () => {
    if (!isOpen) {
      setLogConsoleDisplayMode('open');
      setIsLogConsoleFullScreen(false);
    }
  };

  const handleResizeStart = (height: number) => {
    if (height > 0) {
      openLogConsole();
    }
  };

  const handleHeightChange = (height: number) => {
    document.documentElement.style.removeProperty(
      LOG_CONSOLE_HEIGHT_CSS_VARIABLE,
    );

    if (height === 0) {
      setLogConsoleDisplayMode('collapsed');
      return;
    }

    setLogConsoleHeight(Math.max(height, LOG_CONSOLE_HEIGHT_CONSTRAINTS.min));
    openLogConsole();
  };

  const toggleLogConsoleOpen = () => {
    setLogConsoleDisplayMode(isOpen ? 'collapsed' : 'open');
    setIsLogConsoleFullScreen(false);
  };

  const toggleLogConsoleFullScreen = () => {
    setLogConsoleDisplayMode('open');
    setIsLogConsoleFullScreen(!isFullScreen);
  };

  const closeSelectedLog = () => {
    setLogConsoleSelectedLog(null);
  };

  const changeSource = (sourceId: string) => {
    const filterFields =
      sources.find((source) => source.id === sourceId)?.filterFields ?? [];

    closeSelectedLog();
    setLogConsoleFilters((filters) =>
      filters.filter((filter) =>
        filterFields.some(
          (filterField) => filterField.id === filter.filterFieldId,
        ),
      ),
    );
    setLogConsoleSearch('');
  };

  const closeLogConsole = () => {
    closeSelectedLog();
    setLogConsoleDisplayMode('closed');
    setIsLogConsoleFullScreen(false);
    enqueueToast({
      variant: 'info',
      children: t`Logs console hidden. Open it again from the command menu (${getOsControlSymbol()}K).`,
    });
  };

  const openOrCollapseLabel = isOpen ? t`Collapse` : t`Open`;
  const fullScreenLabel = isFullScreen ? t`Exit full screen` : t`Full screen`;
  const closeLabel = t`Close`;

  const renderActiveSource = () => {
    if (!isClickHouseConfigured) {
      return (
        <SettingsEmptyPlaceholder>
          {t`Logs require ClickHouse to be configured. Please contact your administrator.`}
        </SettingsEmptyPlaceholder>
      );
    }

    if (isSourceLocked(activeSource)) {
      return (
        <StyledUpgradeCardContainer>
          <SettingsEnterpriseFeatureGateCard
            title={t`Upgrade to access audit logs`}
            description={t`Only application logs are available on your current plan. Other log types require an Organization subscription.`}
            buttonTitle={t`Upgrade`}
          />
        </StyledUpgradeCardContainer>
      );
    }

    return <LogConsoleResults key={activeSource.id} source={activeSource} />;
  };

  return (
    <StyledContainer isFullScreen={isFullScreen}>
      <TabListRoot componentInstanceId={LOG_CONSOLE_TAB_LIST_INSTANCE_ID}>
        <StyledTabList
          aria-label={t`Log sources`}
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={LOG_CONSOLE_TAB_LIST_INSTANCE_ID}
          onClickTab={openLogConsole}
          onChangeTab={changeSource}
          rightComponent={
            <StyledBarActions>
              <LightIconButton
                emphasis="subtle"
                tooltip={openOrCollapseLabel}
                aria-label={openOrCollapseLabel}
                onClick={toggleLogConsoleOpen}
              >
                {isOpen ? <IconChevronDown /> : <IconChevronUp />}
              </LightIconButton>
              <LightIconButton
                emphasis="subtle"
                tooltip={fullScreenLabel}
                aria-label={fullScreenLabel}
                onClick={toggleLogConsoleFullScreen}
              >
                {isFullScreen ? <IconMinimize /> : <IconMaximize />}
              </LightIconButton>
              <IconButton
                size="sm"
                variant="outline"
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
          <StyledBody
            bodyHeight={logConsoleBodyHeight}
            isFullScreen={isFullScreen}
          >
            <StyledActiveSource
              isDetailPanelOpen={isDefined(logConsoleSelectedLog)}
            >
              {renderActiveSource()}
            </StyledActiveSource>
            <LogConsoleDetailPanel />
          </StyledBody>
        )}
      </TabListRoot>
      {!isFullScreen && (
        <ResizablePanelEdge
          side="top"
          constraints={logConsoleResizeConstraints}
          currentSize={isOpen ? logConsoleBodyHeight : 0}
          onSizeChange={handleHeightChange}
          onCollapse={toggleLogConsoleOpen}
          cssVariableName={LOG_CONSOLE_HEIGHT_CSS_VARIABLE}
          onResizeStart={handleResizeStart}
        />
      )}
    </StyledContainer>
  );
};
