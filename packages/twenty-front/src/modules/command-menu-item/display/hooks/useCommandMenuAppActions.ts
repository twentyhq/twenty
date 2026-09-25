import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTogglePresentation } from '@/navigation/hooks/useNavigationDrawerTogglePresentation';
import { useSetAdvancedMode } from '@/navigation/hooks/useSetAdvancedMode';
import { useToggleNavigationDrawer } from '@/navigation/hooks/useToggleNavigationDrawer';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconCode, IconCopy, IconTerminal } from 'twenty-ui/icon';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const useCommandMenuAppActions = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { isNavigationDrawerExpanded, toggleNavigationDrawer } =
    useToggleNavigationDrawer();
  const navigationDrawerPresentation = useNavigationDrawerTogglePresentation(
    isNavigationDrawerExpanded,
  );
  const { copyToClipboard } = useCopyToClipboard();
  const { colorScheme, setColorScheme, colorSchemeList } = useColorScheme();
  const isLogsSettingsSectionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED,
  );
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const { setAdvancedMode } = useSetAdvancedMode();
  const isLogConsoleAllowed = useIsLogConsoleAllowed();
  const [logConsoleDisplayMode, setLogConsoleDisplayMode] = useAtomState(
    logConsoleDisplayModeState,
  );
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );
  const setLogConsoleSelectedLog = useSetAtomState(logConsoleSelectedLogState);

  const themeLabels: Record<ColorScheme, string> = {
    Light: t`Change theme to light`,
    Dark: t`Change theme to dark`,
    System: t`Change theme to system`,
  };

  const closeLogConsole = () => {
    setLogConsoleSelectedLog(null);
    setLogConsoleDisplayMode('closed');
    setIsLogConsoleFullScreen(false);
  };

  const appActions = [
    {
      id: 'toggle-navigation-drawer',
      section: 'WORKSPACE',
      ...navigationDrawerPresentation,
      onClick: toggleNavigationDrawer,
      isAvailable: !isMobile && !isSettingsDrawer,
    },
    {
      id: 'copy-page-link',
      section: 'WORKSPACE',
      label: t`Copy link to page`,
      Icon: IconCopy,
      onClick: () =>
        copyToClipboard(window.location.href, t`Link copied to clipboard`),
      isAvailable: true,
    },
    ...colorSchemeList.map((theme) => ({
      id: `change-theme-${theme.id.toLowerCase()}`,
      section: 'WORKSPACE',
      label: themeLabels[theme.id],
      Icon: theme.icon,
      onClick: () => setColorScheme(theme.id),
      isAvailable: theme.id !== colorScheme,
    })),
    {
      id: 'turn-on-developer-mode',
      section: 'DEVELOPER',
      label: t`Turn on developer mode`,
      Icon: IconCode,
      onClick: () => setAdvancedMode(true),
      isAvailable: isLogsSettingsSectionEnabled && !isAdvancedModeEnabled,
    },
    {
      id: 'turn-off-developer-mode',
      section: 'DEVELOPER',
      label: t`Turn off developer mode`,
      Icon: IconCode,
      onClick: () => setAdvancedMode(false),
      isAvailable: isLogsSettingsSectionEnabled && isAdvancedModeEnabled,
    },
    {
      id: 'open-log-console',
      section: 'DEVELOPER',
      label: t`Open logs console`,
      Icon: IconTerminal,
      onClick: () => setLogConsoleDisplayMode('open'),
      isAvailable: isLogConsoleAllowed && logConsoleDisplayMode === 'closed',
    },
    {
      id: 'close-log-console',
      section: 'DEVELOPER',
      label: t`Close logs console`,
      Icon: IconTerminal,
      onClick: closeLogConsole,
      isAvailable: isLogConsoleAllowed && logConsoleDisplayMode !== 'closed',
    },
  ];

  const normalizedSearch = normalizeSearchText(sidePanelSearch.trim());

  return {
    appActions: appActions.filter(
      (item) =>
        !isInPreviewMode &&
        item.isAvailable &&
        normalizeSearchText(item.label).includes(normalizedSearch),
    ),
  };
};
