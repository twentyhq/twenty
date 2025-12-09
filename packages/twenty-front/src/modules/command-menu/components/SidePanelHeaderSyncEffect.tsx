import { useEffect } from 'react';

type SidePanelHeaderTitleSyncEffectProps = {
  initialTitle: string;
  setTitle: (title: string) => void;
};

export const SidePanelHeaderTitleSyncEffect = ({
  initialTitle,
  setTitle,
}: SidePanelHeaderTitleSyncEffectProps) => {
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, setTitle]);

  return null;
};
