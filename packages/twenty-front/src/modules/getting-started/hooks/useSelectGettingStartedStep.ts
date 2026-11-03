import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { gettingStartedJustCompletedStepState } from '@/getting-started/states/gettingStartedJustCompletedStepState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const useSelectGettingStartedStep = () => {
  const setGettingStartedJustCompletedStep = useSetAtomState(
    gettingStartedJustCompletedStepState,
  );
  const { updateGettingStarted, isSaving } = useUpdateGettingStarted();

  const selectGettingStartedStep = (
    stepActionKey: GettingStartedStepActionKey,
  ) => {
    setGettingStartedJustCompletedStep(null);
    void updateGettingStarted({ selectedStepActionKey: stepActionKey });
  };

  return { selectGettingStartedStep, isSaving };
};
