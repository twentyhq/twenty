import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { GettingStartedWorkflowPreview } from '@/getting-started/components/GettingStartedWorkflowPreview';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  type GettingStartedStepActionKey,
  PrepareGettingStartedWorkflowDocument,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

type GettingStartedWorkflowActionProps = {
  stepActionKey: GettingStartedStepActionKey;
};

export const GettingStartedWorkflowAction = ({
  stepActionKey,
}: GettingStartedWorkflowActionProps) => {
  const { t } = useLingui();
  const navigateApp = useNavigateApp();
  const { enqueueToast } = useToast();
  const { progress } = useGettingStartedProgress();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const [prepareGettingStartedWorkflow, { loading }] = useMutation(
    PrepareGettingStartedWorkflowDocument,
  );
  const isWorkflowOn =
    progress?.completedStepActionKeys.includes(stepActionKey) ?? false;

  const openWorkflow = async () => {
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

  return (
    <StyledColumn>
      <GettingStartedWorkflowPreview stepActionKey={stepActionKey} />
      <Button
        variant="solid"
        color="accent"
        loading={loading}
        onClick={() => void openWorkflow()}
      >
        {isWorkflowOn ? t`Open the workflow` : t`Set up the workflow`}
      </Button>
    </StyledColumn>
  );
};
