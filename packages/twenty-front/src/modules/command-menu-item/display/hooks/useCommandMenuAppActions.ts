import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTogglePresentation } from '@/ui/navigation/navigation-drawer/hooks/useNavigationDrawerTogglePresentation';
import { useSetIsLogConsoleEnabled } from '@/log-console/hooks/useSetIsLogConsoleEnabled';
import { useToggleNavigationDrawer } from '@/ui/navigation/navigation-drawer/hooks/useToggleNavigationDrawer';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { isLogConsoleEnabledState } from '@/log-console/states/isLogConsoleEnabledState';
import { isSelectOptionMatchingSearch } from '@/ui/input/components/internal/select/utils/isSelectOptionMatchingSearch';
import { useColorScheme } from '@/workspace-member/hooks/useColorScheme';
import { normalizeSearchText, useIsMobile } from 'twenty-ui/utilities';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconCopy, IconTerminal } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

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
  const isLogConsoleEnabled = useAtomStateValue(isLogConsoleEnabledState);
  const { setIsLogConsoleEnabled } = useSetIsLogConsoleEnabled();
  const isLogConsoleAllowed = useIsLogConsoleAllowed();
  const [logConsoleDisplayMode, setLogConsoleDisplayMode] = useAtomState(
    logConsoleDisplayModeState,
  );

  const themeLabels: Record<ColorScheme, string> = {
    Light: t`Change theme to light`,
    Dark: t`Change theme to dark`,
    System: t`Change theme to system`,
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
      id: 'show-logs',
      section: 'DEVELOPER',
      label: t`Show logs`,
      searchKeywords: t`developer`,
      Icon: IconTerminal,
      onClick: () => setIsLogConsoleEnabled(true),
      isAvailable: isLogConsoleAllowed && !isLogConsoleEnabled,
    },
    {
      id: 'hide-logs',
      section: 'DEVELOPER',
      label: t`Hide logs`,
      searchKeywords: t`developer`,
      Icon: IconTerminal,
      onClick: () => setIsLogConsoleEnabled(false),
      isAvailable: isLogConsoleAllowed && isLogConsoleEnabled,
    },
    {
      id: 'open-log-console',
      section: 'DEVELOPER',
      label: t`Open logs console`,
      searchKeywords: t`developer`,
      Icon: IconTerminal,
      onClick: () => setLogConsoleDisplayMode('open'),
      isAvailable:
        isLogConsoleAllowed &&
        isLogConsoleEnabled &&
        logConsoleDisplayMode !== 'open',
    },
  ];

  const normalizedSearch = normalizeSearchText(sidePanelSearch.trim());

  return {
    appActions: appActions.filter(
      (item) =>
        !isInPreviewMode &&
        item.isAvailable &&
        isSelectOptionMatchingSearch({
          option: item,
          normalizedSearchInputValue: normalizedSearch,
        }),
    ),
  };
};
