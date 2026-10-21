import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

// Resolved synchronously so the content never renders a blank frame before effects settle
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
