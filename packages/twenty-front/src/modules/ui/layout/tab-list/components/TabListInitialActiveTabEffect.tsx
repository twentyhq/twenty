import { useEffect } from 'react';

type TabListInitialActiveTabEffectProps = {
  initialActiveTabId: string | null;
  onSyncActiveTabId: (tabId: string | null) => void;
  onChangeTab?: (tabId: string) => void;
};

export const TabListInitialActiveTabEffect = ({
  initialActiveTabId,
  onSyncActiveTabId,
  onChangeTab,
}: TabListInitialActiveTabEffectProps) => {
  useEffect(() => {
    onSyncActiveTabId(initialActiveTabId);
    onChangeTab?.(initialActiveTabId || '');
  }, [initialActiveTabId, onSyncActiveTabId, onChangeTab]);

  return null;
};
