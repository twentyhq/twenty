import { GETTING_STARTED_AUTO_ADVANCE_DELAY_MS } from '@/getting-started/constants/GettingStartedAutoAdvanceDelayMs';
import { useSelectGettingStartedStep } from '@/getting-started/hooks/useSelectGettingStartedStep';
import { useEffect, useEffectEvent } from 'react';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

type GettingStartedAutoAdvanceEffectProps = {
  completedStepActionKey: GettingStartedStepActionKey;
  nextStepActionKey: GettingStartedStepActionKey;
};

export const GettingStartedAutoAdvanceEffect = ({
  completedStepActionKey,
  nextStepActionKey,
}: GettingStartedAutoAdvanceEffectProps) => {
  const { selectGettingStartedStep } = useSelectGettingStartedStep();
  const advance = useEffectEvent(() =>
    selectGettingStartedStep(nextStepActionKey),
  );

  useEffect(() => {
    const timeoutId = setTimeout(
      () => advance(),
      GETTING_STARTED_AUTO_ADVANCE_DELAY_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [completedStepActionKey]);

  return null;
};
