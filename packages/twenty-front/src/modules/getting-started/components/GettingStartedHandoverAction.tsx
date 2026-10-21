import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { GETTING_STARTED_HANDOVER_WORKFLOW_NODES } from '@/getting-started/constants/GettingStartedHandoverWorkflowNodes';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  GettingStartedStep,
  PrepareGettingStartedHandoverDocument,
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

export const GettingStartedHandoverAction = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigateApp = useNavigateApp();
  const { enqueueToast } = useToast();
  const { progress, refetch } = useGettingStartedProgress();
  const [prepareGettingStartedHandover, { loading }] = useMutation(
    PrepareGettingStartedHandoverDocument,
  );
  const isWorkflowEnabled =
    progress?.completedSteps.includes(GettingStartedStep.HANDOVER_DEALS) ??
    false;

  const prepareHandover = async ({ activate }: { activate: boolean }) => {
    try {
      const { data } = await prepareGettingStartedHandover({
        variables: { activate },
      });

      if (!isDefined(data)) {
        return;
      }

      if (activate) {
        await refetch();

        return;
      }

      navigateApp(AppPath.WorkflowCoreShowPage, {
        coreWorkflowId: data.prepareGettingStartedHandover.workflowId,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <StyledColumn>
      <StyledWorkflowPreview>
        {GETTING_STARTED_HANDOVER_WORKFLOW_NODES.map(
          ({ label, title, Icon }, index) => (
            <Fragment key={index}>
              {index > 0 && <StyledConnector />}
              <WorkflowNodeContainer selected={false}>
                <WorkflowNodeIconContainer>
                  <Icon size={theme.icon.size.md} />
                </WorkflowNodeIconContainer>
                <WorkflowNodeRightPart>
                  <WorkflowNodeLabel selected={false}>
                    {t(label)}
                  </WorkflowNodeLabel>
                  <WorkflowNodeTitle selected={false}>
                    {t(title)}
                  </WorkflowNodeTitle>
                </WorkflowNodeRightPart>
              </WorkflowNodeContainer>
            </Fragment>
          ),
        )}
      </StyledWorkflowPreview>
      <StyledRow>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          loading={loading}
          disabled={isWorkflowEnabled}
          onClick={() => void prepareHandover({ activate: true })}
        >{t`Turn on the workflow`}</Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => void prepareHandover({ activate: false })}
        >{t`Edit the draft`}</Button>
      </StyledRow>
    </StyledColumn>
  );
};
