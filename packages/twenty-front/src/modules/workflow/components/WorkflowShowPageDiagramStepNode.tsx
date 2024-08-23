import { WorkflowDiagramStepNodeData } from '@/workflow/types/WorkflowDiagram';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';

const StyledStepNodeContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding-bottom: 12px;
  padding-top: 6px;
`;

const StyledStepNodeType = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm} 0 0;

  color: ${({ theme }) => theme.color.gray50};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};

  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 0;
  transform: translateY(-100%);

  .selectable.selected &,
  .selectable:focus &,
  .selectable:focus-visible & {
    background-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.font.color.inverted};
  }
`;

const StyledStepNodeInnerContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};

  position: relative;
  box-shadow: ${({ theme }) => theme.boxShadow.superHeavy};

  .selectable.selected &,
  .selectable:focus &,
  .selectable:focus-visible & {
    background-color: ${({ theme }) => theme.color.blue10};
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledStepNodeLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSourceHandle = styled(Handle)`
  background-color: ${({ theme }) => theme.color.gray50};
`;

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

export const WorkflowShowPageDiagramStepNode = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  return (
    <StyledStepNodeContainer>
      {data.nodeType !== 'trigger' ? (
        <StyledTargetHandle type="target" position={Position.Top} />
      ) : null}

      <StyledStepNodeInnerContainer>
        <StyledStepNodeType>{data.nodeType}</StyledStepNodeType>

        <StyledStepNodeLabel>{data.label}</StyledStepNodeLabel>
      </StyledStepNodeInnerContainer>

      <StyledSourceHandle type="source" position={Position.Bottom} />
    </StyledStepNodeContainer>
  );
};
