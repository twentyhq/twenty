import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import {
  CompleteGettingStartedStepDocument,
  type CompleteGettingStartedStepInput,
  GettingStartedProgressDocument,
} from '~/generated-metadata/graphql';

export const useCompleteGettingStartedStep = () => {
  const { enqueueToast } = useToast();

  const [completeGettingStartedStepMutation] = useMutation(
    CompleteGettingStartedStepDocument,
    {
      update: (cache, { data }) => {
        if (!isDefined(data)) {
          return;
        }

        cache.writeQuery({
          query: GettingStartedProgressDocument,
          data: { gettingStartedProgress: data.completeGettingStartedStep },
        });
      },
    },
  );

  const completeGettingStartedStep = async (
    input: CompleteGettingStartedStepInput,
  ) => {
    try {
      await completeGettingStartedStepMutation({ variables: { input } });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { completeGettingStartedStep };
};
