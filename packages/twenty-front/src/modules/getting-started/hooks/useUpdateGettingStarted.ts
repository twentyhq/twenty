import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { gettingStartedJustCompletedStepState } from '@/getting-started/states/gettingStartedJustCompletedStepState';
import { getGettingStartedJustCompletedStep } from '@/getting-started/utils/getGettingStartedJustCompletedStep';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import {
  GettingStartedProgressDocument,
  UpdateGettingStartedDocument,
  type UpdateGettingStartedInput,
} from '~/generated-metadata/graphql';

export const useUpdateGettingStarted = () => {
  const { enqueueToast } = useToast();
  const setGettingStartedJustCompletedStep = useSetAtomState(
    gettingStartedJustCompletedStepState,
  );

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
