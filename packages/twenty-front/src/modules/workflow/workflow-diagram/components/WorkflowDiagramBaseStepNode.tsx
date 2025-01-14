import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { capitalize } from 'twenty-shared';
import { isDefined, OverflowingTextWithTooltip } from 'twenty-ui';

type Variant = 'placeholder';

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

  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};

  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  align-self: flex-start;

  .selectable.selected &,
  .selectable:focus &,
  .selectable:focus-visible & {
    background-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.font.color.inverted};
  }
`;

const StyledStepNodeInnerContainer = styled.div<{ variant?: Variant }>`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-style: ${({ variant }) =>
    variant === 'placeholder' ? 'dashed' : null};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};

  position: relative;
  box-shadow: ${({ variant, theme }) =>
    variant === 'placeholder' ? 'none' : theme.boxShadow.strong};

  .selectable.selected &,
  .selectable:focus &,
  .selectable:focus-visible & {
    background-color: ${({ theme }) => theme.accent.quaternary};
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledStepNodeLabel = styled.div<{ variant?: Variant }>`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  column-gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ variant, theme }) =>
    variant === 'placeholder'
      ? theme.font.color.extraLight
      : theme.font.color.primary};
  max-width: 200px;
`;

const StyledSourceHandle = styled(Handle)`
  background-color: ${({ theme }) => theme.grayScale.gray25};
  border: none;
  width: 4px;
  height: 4px;
`;

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

const StyledRightFloatingElementContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: ${({ theme }) => theme.spacing(-3)};
  bottom: 0;
  top: 0;
  transform: translateX(100%);
`;

export const WorkflowDiagramBaseStepNode = ({
  nodeType,
  name,
  variant,
  Icon,
  RightFloatingElement,
}: {
  nodeType: WorkflowDiagramStepNodeData['nodeType'];
  name: string;
  variant?: Variant;
  Icon?: React.ReactNode;
  RightFloatingElement?: React.ReactNode;
}) => {
  return (
    <StyledStepNodeContainer>
      {nodeType !== 'trigger' ? (
        <StyledTargetHandle type="target" position={Position.Top} />
      ) : null}

      <StyledStepNodeType>{capitalize(nodeType)}</StyledStepNodeType>

      <StyledStepNodeInnerContainer variant={variant}>
        <StyledStepNodeLabel variant={variant}>
          {Icon}

          <OverflowingTextWithTooltip text={name} />
        </StyledStepNodeLabel>

        {isDefined(RightFloatingElement) ? (
          <StyledRightFloatingElementContainer>
            {RightFloatingElement}
          </StyledRightFloatingElementContainer>
        ) : null}
      </StyledStepNodeInnerContainer>

      <StyledSourceHandle type="source" position={Position.Bottom} />
    </StyledStepNodeContainer>
  );
};
