import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTogglePresentation } from '@/navigation/hooks/useNavigationDrawerTogglePresentation';
import { useToggleNavigationDrawer } from '@/navigation/hooks/useToggleNavigationDrawer';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconCopy } from 'twenty-ui/icon';
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

  const themeLabels: Record<ColorScheme, string> = {
    Light: t`Change theme to light`,
    Dark: t`Change theme to dark`,
    System: t`Change theme to system`,
  };

  const appActions = [
    {
      id: 'toggle-navigation-drawer',
      ...navigationDrawerPresentation,
      onClick: toggleNavigationDrawer,
      isAvailable: !isMobile && !isSettingsDrawer,
    },
    {
      id: 'copy-page-link',
      label: t`Copy link to page`,
      Icon: IconCopy,
      onClick: () =>
        copyToClipboard(window.location.href, t`Link copied to clipboard`),
      isAvailable: true,
    },
    ...colorSchemeList.map((theme) => ({
      id: `change-theme-${theme.id.toLowerCase()}`,
      label: themeLabels[theme.id],
      Icon: theme.icon,
      onClick: () => setColorScheme(theme.id),
      isAvailable: theme.id !== colorScheme,
    })),
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
