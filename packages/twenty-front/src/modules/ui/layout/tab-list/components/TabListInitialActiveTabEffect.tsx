import { useEffect } from 'react';

type TabListInitialActiveTabEffectProps = {
  initialActiveTabId: string | null;
  onSyncActiveTabId: (tabId: string | null) => void;
};

export const TabListInitialActiveTabEffect = ({
  initialActiveTabId,
  onSyncActiveTabId,
}: TabListInitialActiveTabEffectProps) => {
  useEffect(() => {
    onSyncActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, onSyncActiveTabId]);

  return null;
};
