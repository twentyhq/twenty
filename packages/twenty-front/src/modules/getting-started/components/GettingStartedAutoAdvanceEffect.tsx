import { GETTING_STARTED_AUTO_ADVANCE_DELAY_MS } from '@/getting-started/constants/GettingStartedAutoAdvanceDelayMs';
import { useEffect, useEffectEvent } from 'react';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

type GettingStartedAutoAdvanceEffectProps = {
  completedStepActionKey: GettingStartedStepActionKey;
  onAdvance: () => void;
};

export const GettingStartedAutoAdvanceEffect = ({
  completedStepActionKey,
  onAdvance,
}: GettingStartedAutoAdvanceEffectProps) => {
  const advance = useEffectEvent(onAdvance);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => advance(),
      GETTING_STARTED_AUTO_ADVANCE_DELAY_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [completedStepActionKey]);

  return null;
};
