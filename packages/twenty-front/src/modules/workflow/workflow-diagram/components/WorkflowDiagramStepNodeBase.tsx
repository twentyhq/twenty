import { NODE_BORDER_WIDTH } from '@/workflow/workflow-diagram/constants/NodeBorderWidth';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { getWorkflowDiagramNodeSelectedColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramNodeSelectedColors';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { MouseEvent } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { Label, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { WorkflowDiagramBaseHandle } from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseHandle';
import { Position } from '@xyflow/react';
import { useEdgeSelected } from '@/workflow/workflow-diagram/hooks/useEdgeSelected';

const StyledStepNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledStepNodeType = styled.div<{
  nodeVariant: WorkflowDiagramNodeVariant;
}>`
  ${({ nodeVariant, theme }) => {
    switch (nodeVariant) {
      case 'running': {
        return css`
          background-color: ${theme.tag.background.yellow};
          color: ${theme.tag.text.yellow};
        `;
      }
      case 'success': {
        return css`
          background-color: ${theme.tag.background.turquoise};
          color: ${theme.tag.text.turquoise};
        `;
      }
      case 'failure': {
        return css`
          background-color: ${theme.tag.background.red};
          color: ${theme.color.red};
        `;
      }
      default: {
        return css`
          background-color: ${theme.background.tertiary};
        `;
      }
    }
  }}

  align-self: flex-start;
  border-radius: ${({ theme }) =>
    `${theme.border.radius.sm} ${theme.border.radius.sm} 0 0`};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  .selectable:is(.selected, :focus, :focus-visible) & {
    ${({ nodeVariant, theme }) => {
      switch (nodeVariant) {
        case 'empty':
        case 'default':
        case 'not-executed':
          return css`
            background-color: ${theme.color.blue};
            color: ${theme.font.color.inverted};
          `;
      }
    }}
  }
`.withComponent(Label);

const StyledStepNodeInnerContainer = styled.div<{
  variant: WorkflowDiagramNodeVariant;
}>`
  background: ${({ theme }) => theme.background.secondary};
  border-color: ${({ theme }) => theme.border.color.medium};

  border-radius: ${({ theme }) => theme.border.radius.md};
  border-style: solid;
  border-width: ${NODE_BORDER_WIDTH}px;
  box-shadow: ${({ variant, theme }) =>
    variant === 'empty' ? 'none' : theme.boxShadow.strong};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};

  position: relative;

  transition: background ${({ theme }) => theme.animation.duration.fast} ease;

  .workflow-node-container:hover & {
    ${({ theme }) => {
      return css`
        background: linear-gradient(
            0deg,
            ${theme.background.transparent.lighter} 0%,
            ${theme.background.transparent.lighter} 100%
          ),
          ${theme.background.secondary};
      `;
    }}
  }

  .selectable:is(.selected, :focus, :focus-visible)
    :is(.workflow-node-container, .workflow-node-container:hover)
    & {
    ${({ theme, variant }) => {
      const colors = getWorkflowDiagramNodeSelectedColors(variant, theme);
      return css`
        background: ${colors.background};
        border-color: ${colors.borderColor};
      `;
    }}
  }
`;

const StyledStepNodeLabel = styled.div<{
  variant: WorkflowDiagramNodeVariant;
}>`
  box-sizing: border-box;
  align-items: center;
  display: flex;
  font-size: 13px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  column-gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'empty':
      case 'not-executed':
        return theme.font.color.light;
      default:
        return theme.font.color.primary;
    }
  }};
  max-width: 200px;
  height: 24px;

  .selectable:is(.selected, :focus, :focus-visible) & {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export const WorkflowDiagramStepNodeBase = ({
  id,
  nodeType,
  name,
  variant,
  Icon,
  RightFloatingElement,
  BottomHoverFloatingElement,
  displayHandle = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  id: string;
  nodeType: WorkflowDiagramStepNodeData['nodeType'];
  name: string;
  variant: WorkflowDiagramNodeVariant;
  Icon?: React.ReactNode;
  RightFloatingElement?: React.ReactNode;
  BottomHoverFloatingElement?: React.ReactNode;
  displayHandle?: boolean;
  onClick?: () => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
}) => {
  const { getNodeHandlesSelectedState } = useEdgeSelected();

  const handlesSelectedState = getNodeHandlesSelectedState(id);

  return (
    <StyledStepNodeContainer
      className="workflow-node-container"
      data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {nodeType !== 'trigger' && (
        <WorkflowDiagramBaseHandle
          type="target"
          position={Position.Top}
          isVisible={displayHandle}
          selected={handlesSelectedState.targetHandle}
        />
      )}

      <StyledStepNodeType variant="small" nodeVariant={variant}>
        {capitalize(nodeType)}
      </StyledStepNodeType>

      <StyledStepNodeInnerContainer variant={variant}>
        <StyledStepNodeLabel variant={variant}>
          {variant === 'running' ? <Loader /> : Icon}

          <OverflowingTextWithTooltip text={name} hideTooltip={true} />
        </StyledStepNodeLabel>

        {RightFloatingElement}

        {BottomHoverFloatingElement}
      </StyledStepNodeInnerContainer>

      <WorkflowDiagramBaseHandle
        type="source"
        position={Position.Bottom}
        isVisible={displayHandle}
        selected={handlesSelectedState.sourceHandle}
      />
    </StyledStepNodeContainer>
  );
};
