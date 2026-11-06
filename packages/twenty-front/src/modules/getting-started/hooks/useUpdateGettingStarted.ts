import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { GETTING_STARTED_AUTO_ADVANCE_DELAY_MS } from '@/getting-started/constants/GettingStartedAutoAdvanceDelayMs';
import { gettingStartedJustCompletedStepState } from '@/getting-started/states/gettingStartedJustCompletedStepState';
import { getGettingStartedJustCompletedStep } from '@/getting-started/utils/getGettingStartedJustCompletedStep';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import {
  GettingStartedProgressDocument,
  type GettingStartedStepActionKey,
  UpdateGettingStartedDocument,
  type UpdateGettingStartedInput,
} from '~/generated-metadata/graphql';

export const useUpdateGettingStarted = () => {
  const store = useStore();
  const { enqueueToast } = useToast();
  const setGettingStartedJustCompletedStep = useSetAtomState(
    gettingStartedJustCompletedStepState,
  );

  const advanceAfterDelay = ({
    completedStepActionKey,
    nextStepActionKey,
  }: {
    completedStepActionKey: GettingStartedStepActionKey;
    nextStepActionKey: GettingStartedStepActionKey;
  }) =>
    setTimeout(() => {
      const isStillShowingCompletedStep =
        store.get(gettingStartedJustCompletedStepState.atom) ===
        completedStepActionKey;

      if (!isStillShowingCompletedStep) {
        return;
      }

      setGettingStartedJustCompletedStep(null);
      void updateGettingStarted({ selectedStepActionKey: nextStepActionKey });
    }, GETTING_STARTED_AUTO_ADVANCE_DELAY_MS);

  const [updateGettingStartedMutation, { loading }] = useMutation(
    UpdateGettingStartedDocument,
    {
      update: (cache, { data }) => {
        if (!isDefined(data)) {
          return;
        }

        const justCompletedStep = getGettingStartedJustCompletedStep({
          previousProgress: cache.readQuery({
            query: GettingStartedProgressDocument,
          })?.gettingStartedProgress,
          progress: data.updateGettingStarted,
        });

        if (isDefined(justCompletedStep)) {
          setGettingStartedJustCompletedStep(justCompletedStep);
          advanceAfterDelay({
            completedStepActionKey: justCompletedStep,
            nextStepActionKey: getGettingStartedStepSelection({
              stepActionKeys: data.updateGettingStarted.steps.map(
                ({ actionKey }) => actionKey,
              ),
              completedStepActionKeys:
                data.updateGettingStarted.completedStepActionKeys,
              selectedStepActionKey: justCompletedStep,
            }).nextStep,
          });
        }

        cache.writeQuery({
          query: GettingStartedProgressDocument,
          data: { gettingStartedProgress: data.updateGettingStarted },
        });
      },
    },
  );

  const updateGettingStarted = async (
    input: UpdateGettingStartedInput,
  ): Promise<boolean> => {
    try {
      await updateGettingStartedMutation({ variables: { input } });

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { updateGettingStarted, isSaving: loading };
};
