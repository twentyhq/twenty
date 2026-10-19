import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import {
  type GettingStartedProgress,
  type GettingStartedStep,
} from 'twenty-shared/types';
import {
  GET_GETTING_STARTED_PROGRESS,
  UPDATE_GETTING_STARTED,
} from '@/getting-started/graphql/gettingStarted';

export type GettingStartedUpdate = {
  completedStep?: GettingStartedStep;
  selectedStep?: GettingStartedStep;
  snoozedUntil?: string | null;
};

export const useUpdateGettingStarted = () => {
  const [mutate, { loading: saving }] = useMutation<
    { updateGettingStarted: GettingStartedProgress },
    { input: GettingStartedUpdate }
  >(UPDATE_GETTING_STARTED, {
    update: (cache, result) => {
      if (result.data?.updateGettingStarted)
        cache.writeQuery({
          query: GET_GETTING_STARTED_PROGRESS,
          data: { gettingStartedProgress: result.data.updateGettingStarted },
        });
    },
  });
  const update = useCallback(
    async (input: GettingStartedUpdate) => {
      await mutate({ variables: { input } });
    },
    [mutate],
  );
  return { update, saving };
};
