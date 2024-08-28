import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { WorkflowShowPageDiagram } from '@/workflow/components/WorkflowShowPageDiagram';
import { WorkflowShowPageEffect } from '@/workflow/components/WorkflowShowPageEffect';
import { WorkflowShowPageHeader } from '@/workflow/components/WorkflowShowPageHeader';
import { showPageWorkflowDiagramState } from '@/workflow/states/showPageWorkflowDiagramState';
import styled from '@emotion/styled';
import '@xyflow/react/dist/style.css';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconSettingsAutomation } from 'twenty-ui';

const StyledFlowContainer = styled.div`
  height: 100%;
  width: 100%;

  /* Below we reset the default styling of Reactflow */
  .react-flow__node-input,
  .react-flow__node-default,
  .react-flow__node-output,
  .react-flow__node-group {
    padding: 0;
  }

  --xy-node-border-radius: none;
  --xy-node-border: none;
  --xy-node-background-color: none;
  --xy-node-boxshadow-hover: none;
  --xy-node-boxshadow-selected: none;
`;

export const WorkflowShowPage = () => {
  const parameters = useParams<{
    workflowId: string;
  }>();

  const workflowName = 'Test Workflow';

  const showPageWorkflowDiagram = useRecoilValue(showPageWorkflowDiagramState);

  if (parameters.workflowId === undefined) {
    return null;
  }

  return (
    <PageContainer>
      <WorkflowShowPageEffect workflowId={parameters.workflowId} />

      <PageTitle title={workflowName} />
      <WorkflowShowPageHeader
        workflowName={workflowName}
        headerIcon={IconSettingsAutomation}
      />
      <PageBody>
        <StyledFlowContainer>
          {showPageWorkflowDiagram === undefined ? null : (
            <WorkflowShowPageDiagram diagram={showPageWorkflowDiagram} />
          )}
        </StyledFlowContainer>
      </PageBody>
    </PageContainer>
  );
};
