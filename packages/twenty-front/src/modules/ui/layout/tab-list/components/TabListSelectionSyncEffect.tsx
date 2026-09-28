import { useStore } from 'jotai';
import { useEffect } from 'react';

import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';

type TabListSelectionSyncEffectProps = {
  componentInstanceId: string;
  nextActiveTabId: string | null;
  onChangeTab?: (tabId: string) => void;
};

export const TabListSelectionSyncEffect = ({
  componentInstanceId,
  nextActiveTabId,
  onChangeTab,
}: TabListSelectionSyncEffectProps) => {
  const store = useStore();

  useEffect(() => {
    const activeTabIdAtom = activeTabIdComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

    if (store.get(activeTabIdAtom) === nextActiveTabId) {
      return;
    }

    store.set(activeTabIdAtom, nextActiveTabId);
    onChangeTab?.(nextActiveTabId ?? '');
  }, [componentInstanceId, nextActiveTabId, onChangeTab, store]);

  return null;
};
