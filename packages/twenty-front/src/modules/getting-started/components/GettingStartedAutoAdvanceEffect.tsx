import { GETTING_STARTED_AUTO_ADVANCE_DELAY_MS } from '@/getting-started/constants/GettingStartedAutoAdvanceDelayMs';
import { useEffect, useEffectEvent } from 'react';

import { type GettingStartedStep } from '~/generated-metadata/graphql';

type GettingStartedAutoAdvanceEffectProps = {
  completedStep: GettingStartedStep;
  onAdvance: () => void;
};

export const GettingStartedAutoAdvanceEffect = ({
  completedStep,
  onAdvance,
}: GettingStartedAutoAdvanceEffectProps) => {
  const advance = useEffectEvent(onAdvance);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => advance(),
      GETTING_STARTED_AUTO_ADVANCE_DELAY_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [completedStep]);

  return null;
};
