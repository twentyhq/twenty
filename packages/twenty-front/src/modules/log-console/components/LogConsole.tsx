import { formatShortcut } from 'twenty-ui/primitives/typography';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useReducedMotion } from 'framer-motion';
import { type TransitionEvent, useSyncExternalStore, useState } from 'react';
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

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { LogConsoleDetailPanel } from '@/log-console/components/LogConsoleDetailPanel';
import { LogConsoleToggleHotkeyEffect } from '@/log-console/components/LogConsoleToggleHotkeyEffect';
import { LogConsoleResults } from '@/log-console/components/LogConsoleResults';
import { LOG_CONSOLE_ANIMATION_EASING } from '@/log-console/constants/LogConsoleAnimationEasing';
import { LOG_CONSOLE_HEIGHT_CONSTRAINTS } from '@/log-console/constants/LogConsoleHeightConstraints';
import { LOG_CONSOLE_NARROW_BODY_MAX_WIDTH } from '@/log-console/constants/LogConsoleNarrowBodyMaxWidth';
import { LOG_CONSOLE_SOURCES } from '@/log-console/constants/LogConsoleSources';
import { LOG_CONSOLE_TAB_LIST_INSTANCE_ID } from '@/log-console/constants/LogConsoleTabListInstanceId';
import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
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
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

const LOG_CONSOLE_HEIGHT_CSS_VARIABLE = '--log-console-height';

const LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE =
  '--log-console-detail-panel-width';

const LOG_CONSOLE_MIN_PAGE_HEIGHT = 120;

const LOG_CONSOLE_TOP_BORDER_WIDTH = '1px';

const LOG_CONSOLE_BAR_BOTTOM_BORDER_WIDTH = '1px';

const LOG_CONSOLE_TRANSITION_TIMING = `calc(${themeCssVariables.animation.duration.normal} * 1s) ${LOG_CONSOLE_ANIMATION_EASING}`;

const LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS = {
  min: 280,
  max: 800,
  default: 380,
};

type LogConsoleLayout = {
  isOpen: boolean;
  isFullScreen: boolean;
};

const getLogConsoleTransition = (isResizing: boolean, properties: string[]) =>
  isResizing
    ? 'none'
    : properties
        .map((property) => `${property} ${LOG_CONSOLE_TRANSITION_TIMING}`)
        .join(', ');

const StyledSpacer = styled.div<{
  isResizing: boolean;
  spacerHeight: string;
}>`
  flex: none;
  height: ${({ spacerHeight }) => spacerHeight};
  transition: ${({ isResizing }) =>
    getLogConsoleTransition(isResizing, ['height'])};

  @media (prefers-reduced-motion: no-preference) {
    &[data-animate-entrance='true'] {
      animation: logConsoleSpacerEntrance ${LOG_CONSOLE_TRANSITION_TIMING};
    }
  }

  @keyframes logConsoleSpacerEntrance {
    from {
      height: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media print {
    display: none;
  }
`;

const StyledPanel = styled.div<{
  isExiting: boolean;
  isFullScreen: boolean;
  isResizing: boolean;
  panelHeight: string;
}>`
  ${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE}: ${({ isFullScreen }) =>
    isFullScreen ? `${APP_HEADER_HEIGHT}px` : TAB_LIST_HEIGHT};

  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-top: ${({ isFullScreen }) =>
      isFullScreen ? '0px' : LOG_CONSOLE_TOP_BORDER_WIDTH}
    solid ${themeCssVariables.border.color.medium};
  bottom: 0;
  box-shadow: ${themeCssVariables.boxShadow.bottomPanel};
  box-sizing: border-box;
  clip-path: inset(calc(-1 * ${themeCssVariables.spacing[6]}) 0 0 0);
  display: flex;
  flex-direction: column;
  height: ${({ panelHeight }) => panelHeight};
  left: 0;
  opacity: ${({ isExiting }) => (isExiting ? 0 : 1)};
  overflow: hidden;
  position: absolute;
  right: 0;
  transition: ${({ isResizing }) =>
    getLogConsoleTransition(isResizing, [
      'height',
      'border-top-width',
      'opacity',
    ])};
  z-index: ${RootStackingContextZIndices.LogConsole};

  @media (prefers-reduced-motion: no-preference) {
    &[data-animate-entrance='true'] {
      animation: logConsolePanelEntrance ${LOG_CONSOLE_TRANSITION_TIMING};
    }
  }

  @keyframes logConsolePanelEntrance {
    from {
      height: 0;
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media print {
    display: none;
  }
`;

const StyledTabList = styled(TabList)`
  && {
    background-color: ${themeCssVariables.background.secondary};
    flex-shrink: 0;
    height: var(${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE});
    padding-left: ${themeCssVariables.spacing[2]};
    transition: height ${LOG_CONSOLE_TRANSITION_TIMING};
  }

  @media (prefers-reduced-motion: reduce) {
    && {
      transition: none;
    }
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

const StyledBody = styled.div`
  container-name: log-console-body;
  container-type: inline-size;
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
`;

const StyledActiveSource = styled.div<{ isDetailPanelOpen: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

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

const StyledDetailPanelWrapper = styled.div<{
  detailPanelWidth: number;
  isOpen: boolean;
  isResizing: boolean;
}>`
  overflow: hidden;
  position: relative;
  transition: ${({ isResizing }) =>
    getLogConsoleTransition(isResizing, ['width'])};
  width: ${({ isOpen, isResizing, detailPanelWidth }) =>
    !isOpen
      ? '0px'
      : isResizing
        ? `var(${LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE}, ${detailPanelWidth}px)`
        : `${detailPanelWidth}px`};

  @container log-console-body (max-width: ${LOG_CONSOLE_NARROW_BODY_MAX_WIDTH}px) {
    position: static;
  }
`;

export const LogConsole = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

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
  const [logConsoleSelectedLog, setLogConsoleSelectedLog] = useAtomState(
    logConsoleSelectedLogState,
  );
  const [detailPanelWidth, setDetailPanelWidth] = useState(
    LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS.default,
  );
  const [isDetailPanelResizing, setIsDetailPanelResizing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const isOpen = logConsoleDisplayMode === 'open';
  const isFullScreen = isOpen && isLogConsoleFullScreen;
  const isVisible = isLogConsoleAllowed && logConsoleDisplayMode !== 'closed';

  const [renderedLayout, setRenderedLayout] = useState<LogConsoleLayout | null>(
    isVisible ? { isOpen, isFullScreen } : null,
  );
  const [shouldAnimateEntrance, setShouldAnimateEntrance] = useState(false);
  const [isBodyMounted, setIsBodyMounted] = useState(isVisible && isOpen);

  if (
    isVisible &&
    (renderedLayout?.isOpen !== isOpen ||
      renderedLayout?.isFullScreen !== isFullScreen)
  ) {
    if (!isDefined(renderedLayout)) {
      setShouldAnimateEntrance(true);
    }
    setRenderedLayout({ isOpen, isFullScreen });
  }

  if (!isVisible && isDefined(renderedLayout) && shouldReduceMotion) {
    setRenderedLayout(null);
    setIsBodyMounted(false);
  }

  const displayedLayout = isVisible ? { isOpen, isFullScreen } : renderedLayout;
  const isExiting = !isVisible && isDefined(renderedLayout);

  if (displayedLayout?.isOpen && !isBodyMounted) {
    setIsBodyMounted(true);
  }

  if (!isDefined(logConsoleSelectedLog) && isDetailPanelResizing) {
    setIsDetailPanelResizing(false);
  }

  const windowHeight = useSyncExternalStore(
    subscribeToWindowResize,
    getWindowHeight,
  );

  const appHeight = windowHeight / getUiZoom();
  const logConsoleResizeConstraints = {
    min: 0,
    max: Math.max(
      appHeight - APP_HEADER_HEIGHT - LOG_CONSOLE_MIN_PAGE_HEIGHT,
      LOG_CONSOLE_HEIGHT_CONSTRAINTS.min,
    ),
    default: appHeight / 2,
  };
  const logConsoleBodyHeight = Math.min(
    Math.max(
      logConsoleHeight ?? logConsoleResizeConstraints.default,
      LOG_CONSOLE_HEIGHT_CONSTRAINTS.min,
    ),
    logConsoleResizeConstraints.max,
  );

  const toggleLogConsoleOpen = () => {
    setLogConsoleDisplayMode(isOpen ? 'collapsed' : 'open');
    setIsLogConsoleFullScreen(false);
  };

  const toggleHotkeyLabel = formatShortcut({
    shortcut: ['Mod', 'J'],
  });

  const toggleHotkeyEffect = isLogConsoleAllowed ? (
    <LogConsoleToggleHotkeyEffect onToggle={toggleLogConsoleOpen} />
  ) : null;

  if (!isDefined(displayedLayout)) {
    return toggleHotkeyEffect;
  }

  const isBodyRendered =
    displayedLayout.isOpen || (isBodyMounted && !shouldReduceMotion);

  const resizedBodyHeight = isResizing
    ? `var(${LOG_CONSOLE_HEIGHT_CSS_VARIABLE}, ${logConsoleBodyHeight}px)`
    : `${logConsoleBodyHeight}px`;
  const bodyHeight = `max(${LOG_CONSOLE_HEIGHT_CONSTRAINTS.min}px, ${resizedBodyHeight})`;
  const collapsedHeight = `calc(${TAB_LIST_HEIGHT} + ${LOG_CONSOLE_TOP_BORDER_WIDTH} - ${LOG_CONSOLE_BAR_BOTTOM_BORDER_WIDTH})`;
  const openHeight = `calc(${TAB_LIST_HEIGHT} + ${LOG_CONSOLE_TOP_BORDER_WIDTH} + ${bodyHeight})`;
  const spacerHeight = isExiting
    ? '0px'
    : displayedLayout.isOpen
      ? openHeight
      : collapsedHeight;
  const panelHeight =
    !isExiting && displayedLayout.isFullScreen ? '100%' : spacerHeight;

  const hasAuditLogsEntitlement = checkIfBillingEntitlementIsEnabledOnWorkspace(
    BillingEntitlementKey.AUDIT_LOGS,
    currentWorkspace,
  );

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
    setIsResizing(true);

    if (height > 0) {
      openLogConsole();
    }
  };

  const handleDetailPanelWidthChange = (width: number) => {
    document.documentElement.style.removeProperty(
      LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE,
    );
    setDetailPanelWidth(
      Math.max(width, LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS.min),
    );
    setIsDetailPanelResizing(false);
  };

  const handleHeightChange = (height: number) => {
    setIsResizing(false);

    if (height === 0) {
      setLogConsoleDisplayMode('collapsed');
      return;
    }

    setLogConsoleHeight(Math.max(height, LOG_CONSOLE_HEIGHT_CONSTRAINTS.min));
    openLogConsole();
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
  };

  const closeLogConsole = () => {
    closeSelectedLog();
    setLogConsoleDisplayMode('closed');
    setIsLogConsoleFullScreen(false);
    enqueueToast({
      variant: 'info',
      children: t`Logs console hidden. Press ${toggleHotkeyLabel} to open it again.`,
    });
  };

  const handlePanelTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'height'
    ) {
      return;
    }

    if (isExiting) {
      setRenderedLayout(null);
      setIsBodyMounted(false);
      return;
    }

    if (!displayedLayout.isOpen) {
      setIsBodyMounted(false);
    }
  };

  const openOrCollapseLabel = displayedLayout.isOpen ? t`Collapse` : t`Open`;
  const fullScreenLabel = displayedLayout.isFullScreen
    ? t`Exit full screen`
    : t`Full screen`;
  const closeLabel = t`Close`;

  const renderActiveSource = () => {
    if (!isClickHouseConfigured) {
      return (
        <SettingsEmptyPlaceholder>
          {t`Logs require ClickHouse to be configured. Please contact your administrator.`}
        </SettingsEmptyPlaceholder>
      );
    }

    if (!isDefined(activeSource)) {
      return null;
    }

    if (isSourceLocked(activeSource)) {
      return (
        <StyledUpgradeCardContainer>
          <SettingsEnterpriseFeatureGateCard
            title={t`Upgrade to access audit logs`}
            description={t`Record changes and app logs are available on your current plan. Other log types require an Organization subscription.`}
            buttonTitle={t`Upgrade`}
          />
        </StyledUpgradeCardContainer>
      );
    }

    return <LogConsoleResults key={activeSource.id} source={activeSource} />;
  };

  return (
    <>
      {toggleHotkeyEffect}
      <StyledSpacer
        data-animate-entrance={shouldAnimateEntrance}
        isResizing={isResizing}
        spacerHeight={spacerHeight}
      />
      <StyledPanel
        isExiting={isExiting}
        isFullScreen={displayedLayout.isFullScreen}
        isResizing={isResizing}
        panelHeight={panelHeight}
        data-animate-entrance={shouldAnimateEntrance}
        onTransitionEnd={handlePanelTransitionEnd}
      >
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
                  tooltip={closeLabel}
                  aria-label={closeLabel}
                  onClick={closeLogConsole}
                >
                  <IconX />
                </LightIconButton>
                <LightIconButton
                  emphasis="subtle"
                  tooltip={fullScreenLabel}
                  aria-label={fullScreenLabel}
                  onClick={toggleLogConsoleFullScreen}
                >
                  {displayedLayout.isFullScreen ? (
                    <IconMinimize />
                  ) : (
                    <IconMaximize />
                  )}
                </LightIconButton>
                <IconButton
                  size="sm"
                  variant="outline"
                  tooltip={`${openOrCollapseLabel} | ${toggleHotkeyLabel}`}
                  aria-label={openOrCollapseLabel}
                  onClick={toggleLogConsoleOpen}
                >
                  {displayedLayout.isOpen ? (
                    <IconChevronDown />
                  ) : (
                    <IconChevronUp />
                  )}
                </IconButton>
              </StyledBarActions>
            }
          />
          {isBodyRendered && (
            <StyledBody>
              <StyledActiveSource
                isDetailPanelOpen={isDefined(logConsoleSelectedLog)}
              >
                {renderActiveSource()}
              </StyledActiveSource>
              <StyledDetailPanelWrapper
                detailPanelWidth={detailPanelWidth}
                isOpen={isDefined(logConsoleSelectedLog)}
                isResizing={isDetailPanelResizing}
              >
                {isDefined(logConsoleSelectedLog) && (
                  <ResizablePanelEdge
                    side="left"
                    constraints={LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS}
                    currentSize={detailPanelWidth}
                    onSizeChange={handleDetailPanelWidthChange}
                    cssVariableName={LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE}
                    showHandle={false}
                    onResizeStart={() => setIsDetailPanelResizing(true)}
                  />
                )}
                <LogConsoleDetailPanel />
              </StyledDetailPanelWrapper>
            </StyledBody>
          )}
        </TabListRoot>
        {!displayedLayout.isFullScreen && (
          <ResizablePanelEdge
            side="top"
            constraints={logConsoleResizeConstraints}
            currentSize={isOpen ? logConsoleBodyHeight : 0}
            onSizeChange={handleHeightChange}
            cssVariableName={LOG_CONSOLE_HEIGHT_CSS_VARIABLE}
            onResizeStart={handleResizeStart}
          />
        )}
      </StyledPanel>
    </>
  );
};
