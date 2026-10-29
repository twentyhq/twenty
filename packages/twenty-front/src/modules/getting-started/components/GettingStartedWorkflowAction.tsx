import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getTriggerTypeIcon } from '@/workflow/workflow-trigger/utils/getTriggerTypeIcon';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  type GettingStartedStep,
  GettingStartedWorkflowPreviewsDocument,
  PrepareGettingStartedWorkflowDocument,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledWorkflowPreview = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledConnector = styled.div`
  background: ${themeCssVariables.border.color.medium};
  height: ${themeCssVariables.spacing[4]};
  width: 1px;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

type GettingStartedWorkflowActionProps = {
  step: GettingStartedStep;
};

export const GettingStartedWorkflowAction = ({
  step,
}: GettingStartedWorkflowActionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const navigateApp = useNavigateApp();
  const { enqueueToast } = useToast();
  const { progress, refetch } = useGettingStartedProgress();
  const [prepareGettingStartedWorkflow, { loading }] = useMutation(
    PrepareGettingStartedWorkflowDocument,
  );
  const { data: workflowPreviewsData } = useQuery(
    GettingStartedWorkflowPreviewsDocument,
  );
  const isWorkflowEnabled = progress?.completedSteps.includes(step) ?? false;

  const workflowPreview =
    workflowPreviewsData?.gettingStartedWorkflowPreviews.find(
      (preview) => preview.step === step,
    );

  const previewNodes = isDefined(workflowPreview)
    ? [
        {
          label: t`Trigger`,
          title: workflowPreview.trigger.title,
          Icon: getIcon(
            getTriggerTypeIcon({
              type: workflowPreview.trigger.type,
              databaseEvent: workflowPreview.trigger.databaseEventAction,
            }),
          ),
        },
        ...workflowPreview.actions.map((action) => ({
          label: t`Action`,
          title: action.title,
          Icon: getIcon(getActionIcon(action.type)),
        })),
      ]
    : [];

  const prepareWorkflow = async ({ activate }: { activate: boolean }) => {
    try {
      const { data } = await prepareGettingStartedWorkflow({
        variables: { step, activate },
      });

      if (!isDefined(data)) {
        return;
      }

      if (activate) {
        await refetch();

        return;
      }

      navigateApp(AppPath.WorkflowCoreShowPage, {
        coreWorkflowId: data.prepareGettingStartedWorkflow.workflowId,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <StyledColumn>
      <StyledWorkflowPreview>
        {previewNodes.map(({ label, title, Icon }, index) => (
          <Fragment key={index}>
            {index > 0 && <StyledConnector />}
            <WorkflowNodeContainer selected={false}>
              <WorkflowNodeIconContainer>
                <Icon size={theme.icon.size.md} />
              </WorkflowNodeIconContainer>
              <WorkflowNodeRightPart>
                <WorkflowNodeLabel selected={false}>{label}</WorkflowNodeLabel>
                <WorkflowNodeTitle selected={false} highlight>
                  {title}
                </WorkflowNodeTitle>
              </WorkflowNodeRightPart>
            </WorkflowNodeContainer>
          </Fragment>
        ))}
      </StyledWorkflowPreview>
      <StyledRow>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          loading={loading}
          disabled={isWorkflowEnabled}
          onClick={() => void prepareWorkflow({ activate: true })}
        >{t`Turn on the workflow`}</Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => void prepareWorkflow({ activate: false })}
        >{t`Edit the draft`}</Button>
      </StyledRow>
    </StyledColumn>
  );
};
