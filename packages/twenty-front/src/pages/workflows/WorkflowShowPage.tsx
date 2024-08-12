import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import {
  Background,
  Handle,
  MarkerType,
  Node,
  Position,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GRAY_SCALE, IconSettingsAutomation } from 'twenty-ui';
import { WorkflowShowPageHeader } from '~/pages/workflows/WorkflowShowPageHeader';

type NodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
};

const StyledFlowContainer = styled.div`
  height: 100%;
  width: 100%;

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
  const nodes: Array<Node<NodeData>> = [
    {
      id: '1',
      data: {
        nodeType: 'trigger',
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      id: '2',
      data: {
        nodeType: 'action',
      },
      position: {
        x: 0,
        y: 100,
      },
    },
  ];

  const parameters = useParams<{
    workflowId: string;
  }>();
  const workflowName = 'Test Workflow';

  return (
    <PageContainer>
      <PageTitle title={workflowName} />
      <WorkflowShowPageHeader
        workflowName={workflowName}
        headerIcon={IconSettingsAutomation}
      ></WorkflowShowPageHeader>
      <PageBody>
        <StyledFlowContainer>
          <ReactFlow
            nodeTypes={{
              default: StepNode,
            }}
            fitView
            defaultNodes={nodes}
            defaultEdges={[
              {
                id: 'edge-1',
                source: '1',
                target: '2',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              },
            ]}
          >
            <Background color={GRAY_SCALE.gray25} size={2} />
          </ReactFlow>
        </StyledFlowContainer>
      </PageBody>
    </PageContainer>
  );
};

const StyledStepNodeContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding: 12px 0;
`;

const StyledStepNodeType = styled.div`
  align-self: flex-start;

  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm} 0 0;
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: #b3b3b3;
`;

const StyledStepNodeInnerContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};

  box-shadow: ${({ theme }) => theme.boxShadow.superHeavy};

  .selectable.selected &,
  .selectable:focus &,
  .selectable:focus-visible & {
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
  }
`;

const StyledStepNodeLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StepNode = ({ data }: { data: NodeData }) => {
  return (
    <StyledStepNodeContainer>
      {data.nodeType !== 'trigger' ? (
        <Handle type="target" position={Position.Top} />
      ) : null}

      <StyledStepNodeType>{data.nodeType}</StyledStepNodeType>

      <StyledStepNodeInnerContainer>
        <StyledStepNodeLabel>Yolo</StyledStepNodeLabel>
      </StyledStepNodeInnerContainer>

      <Handle type="source" position={Position.Bottom} />
    </StyledStepNodeContainer>
  );
};
