import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

// Resolves the active tab synchronously so the content never renders a null/blank
// frame before the effects settle: the stored tab if still valid, else the URL hash,
// else the first tab.
export const useSettingsActiveTabId = (
  componentInstanceId: string,
  tabIds: string[],
): string | null => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );
  const { hash } = useLocation();

  if (isDefined(activeTabId) && tabIds.includes(activeTabId)) {
    return activeTabId;
  }

  const hashTabId = hash.replace('#', '');
  if (tabIds.includes(hashTabId)) {
    return hashTabId;
  }

  return tabIds[0] ?? null;
};
