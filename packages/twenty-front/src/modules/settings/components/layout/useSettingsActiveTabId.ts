import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

// Resolves the active tab synchronously so the content never renders a null/blank
// frame before the effects settle: the URL hash if it points to a tab (so deep-links
// win), else the stored tab if still valid, else the first tab.
export const useSettingsActiveTabId = (
  componentInstanceId: string,
  tabIds: string[],
): string | null => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );
  const { hash } = useLocation();

  const hashTabId = hash.replace('#', '');
  if (tabIds.includes(hashTabId)) {
    return hashTabId;
  }

  if (isDefined(activeTabId) && tabIds.includes(activeTabId)) {
    return activeTabId;
  }

  return tabIds[0] ?? null;
};
