import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { useMutation } from '@apollo/client/react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  type GettingStartedStepActionKey,
  PrepareGettingStartedWorkflowDocument,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useOpenGettingStartedWorkflow = (
  stepActionKey: GettingStartedStepActionKey,
) => {
  const navigateApp = useNavigateApp();
  const { enqueueToast } = useToast();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const [prepareGettingStartedWorkflow, { loading }] = useMutation(
    PrepareGettingStartedWorkflowDocument,
  );

  const openGettingStartedWorkflow = async () => {
    try {
      const { data } = await prepareGettingStartedWorkflow({
        variables: { stepActionKey },
      });

      if (!isDefined(data)) {
        return;
      }

      void updateGettingStarted({ completedStepActionKey: stepActionKey });
      navigateApp(AppPath.WorkflowCoreShowPage, {
        coreWorkflowId: data.prepareGettingStartedWorkflow.workflowId,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { openGettingStartedWorkflow, isOpeningWorkflow: loading };
};
