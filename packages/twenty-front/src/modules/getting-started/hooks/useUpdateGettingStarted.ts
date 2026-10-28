import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import {
  GettingStartedProgressDocument,
  UpdateGettingStartedDocument,
  type UpdateGettingStartedInput,
} from '~/generated-metadata/graphql';

export const useUpdateGettingStarted = () => {
  const { enqueueToast } = useToast();

  const [updateGettingStartedMutation, { loading }] = useMutation(
    UpdateGettingStartedDocument,
    {
      update: (cache, { data }) => {
        if (!isDefined(data)) {
          return;
        }

        cache.writeQuery({
          query: GettingStartedProgressDocument,
          data: { gettingStartedProgress: data.updateGettingStarted },
        });
      },
    },
  );

  const updateGettingStarted = useCallback(
    async (input: UpdateGettingStartedInput) => {
      try {
        await updateGettingStartedMutation({ variables: { input } });
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      }
    },
    [updateGettingStartedMutation, enqueueToast],
  );

  return { updateGettingStarted, isSaving: loading };
};
