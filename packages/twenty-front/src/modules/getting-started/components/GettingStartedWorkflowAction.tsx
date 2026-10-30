import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
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
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledWorkflowPreview = styled.div`
  align-items: center;
  align-self: stretch;
  background-color: ${themeCssVariables.background.primary};
  background-image: radial-gradient(
    circle,
    ${themeCssVariables.border.color.medium} 1px,
    transparent 1px
  );
  background-position: ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[2]};
  background-size: calc(
      ${themeCssVariables.spacing[4]} + ${themeCssVariables.spacing['0.5']}
    )
    calc(${themeCssVariables.spacing[4]} + ${themeCssVariables.spacing['0.5']});
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledEdge = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(
    ${themeCssVariables.spacing[7]} + ${NODE_HANDLE_HEIGHT_PX / 2}px
  );
  margin-top: -${NODE_HANDLE_HEIGHT_PX / 2}px;
  position: relative;
`;

const StyledEdgeHandle = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.rounded};
  box-sizing: border-box;
  flex-shrink: 0;
  height: ${NODE_HANDLE_HEIGHT_PX}px;
  width: ${NODE_HANDLE_WIDTH_PX}px;
`;

const StyledEdgeLine = styled.div`
  background: ${themeCssVariables.border.color.strong};
  flex: 1;
  width: 1px;
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
  const { progress } = useGettingStartedProgress();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const [prepareGettingStartedWorkflow, { loading }] = useMutation(
    PrepareGettingStartedWorkflowDocument,
  );
  const { data: workflowPreviewsData } = useQuery(
    GettingStartedWorkflowPreviewsDocument,
  );
  const isWorkflowOn = progress?.completedSteps.includes(step) ?? false;

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

  const openWorkflow = async () => {
    try {
      const { data } = await prepareGettingStartedWorkflow({
        variables: { step },
      });

      if (!isDefined(data)) {
        return;
      }

      void updateGettingStarted({ completedStep: step });
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
            {index > 0 && (
              <StyledEdge aria-hidden>
                <StyledEdgeHandle />
                <StyledEdgeLine />
                <svg width={10} height={8} viewBox="0 0 10 8">
                  <path
                    d="M1.7915 1.38672H8.18311C8.57541 1.38705 8.81458 1.81852 8.60693 2.15137L5.41064 7.26465C5.21481 7.57798 4.75882 7.57798 4.56299 7.26465L1.3667 2.15137C1.15906 1.81841 1.39896 1.38672 1.7915 1.38672Z"
                    stroke={theme.border.color.strong}
                    fill={theme.background.primary}
                  />
                </svg>
              </StyledEdge>
            )}
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
