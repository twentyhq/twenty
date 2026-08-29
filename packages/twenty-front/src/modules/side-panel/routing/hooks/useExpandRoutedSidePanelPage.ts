import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useNavigate } from 'react-router-dom';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';

// A routed page expands by handing its own path to the main outlet, so every
// hostable route gets expansion without a hook of its own.
export const useExpandRoutedSidePanelPage = (): SidePanelExpandTarget | null => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const currentRoutedPath = useCurrentSidePanelRoutedPath();

  if (!isDefined(currentRoutedPath)) {
    return null;
  }

  return {
    label: t`Open in full page`,
    expand: () => {
      void closeSidePanelMenu();
      navigate(currentRoutedPath);
    },
    hasExpandShortcut: true,
  };
};
