import {
  openRecordInSidePanel,
  unmountFrontComponent,
  useFrontComponentId,
} from '@/sdk/front-component';
import { useEffect, useState } from 'react';

export type CommandOpenRecordInSidePanelProps = {
  recordId: string;
  objectNameSingular: string;
  resetNavigationStack?: boolean;
  onClick?: () => void;
};

export const CommandOpenRecordInSidePanel = ({
  recordId,
  objectNameSingular,
  resetNavigationStack = false,
  onClick,
}: CommandOpenRecordInSidePanelProps) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const frontComponentId = useFrontComponentId();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      onClick?.();

      await openRecordInSidePanel({
        recordId,
        objectNameSingular,
        resetNavigationStack,
      });

      await unmountFrontComponent();
    };

    run();
  }, [
    recordId,
    objectNameSingular,
    resetNavigationStack,
    onClick,
    hasExecuted,
    frontComponentId,
  ]);

  return null;
};
