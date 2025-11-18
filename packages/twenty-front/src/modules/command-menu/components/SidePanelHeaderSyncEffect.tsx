import { useEffect } from 'react';

type SidePanelHeaderTitleSyncEffectProps = {
  initialTitle: string;
  onSync: (title: string) => void;
};

export const SidePanelHeaderTitleSyncEffect = ({
  initialTitle,
  onSync,
}: SidePanelHeaderTitleSyncEffectProps) => {
  useEffect(() => {
    onSync(initialTitle);
  }, [initialTitle, onSync]);

  return null;
};
