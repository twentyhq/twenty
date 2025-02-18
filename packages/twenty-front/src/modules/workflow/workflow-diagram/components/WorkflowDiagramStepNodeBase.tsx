import { NODE_BORDER_WIDTH } from '@/workflow/workflow-diagram/constants/NodeBorderWidth';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { NODE_ICON_LEFT_MARGIN } from '@/workflow/workflow-diagram/constants/NodeIconLeftMargin';
import { NODE_ICON_WIDTH } from '@/workflow/workflow-diagram/constants/NodeIconWidth';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { capitalize, isDefined } from 'twenty-shared';
import { Label, OverflowingTextWithTooltip } from 'twenty-ui';

const StyledStepNodeContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding-block: ${({ theme }) => theme.spacing(3)};
`;

const StyledStepNodeType = styled.div<{
  nodeVariant: WorkflowDiagramNodeVariant;
}>`
  ${({ nodeVariant, theme }) => {
    switch (nodeVariant) {
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
      switch (variant) {
        case 'success': {
          return css`
            background: ${theme.adaptiveColors.turquoise1};
            border-color: ${theme.adaptiveColors.turquoise4};
          `;
        }
        case 'failure': {
          return css`
            background: ${theme.background.danger};
            border-color: ${theme.color.red};
          `;
        }
        default: {
          return css`
            background: ${theme.adaptiveColors.blue1};
            border-color: ${theme.color.blue};
          `;
        }
      }
    }}
  }
`;

const StyledStepNodeLabel = styled.div<{
  variant: WorkflowDiagramNodeVariant;
}>`
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

  .selectable:is(.selected, :focus, :focus-visible) & {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export const StyledHandle = styled(Handle)`
  height: ${NODE_HANDLE_HEIGHT_PX}px;
  width: ${NODE_HANDLE_WIDTH_PX}px;
`;

const StyledSourceHandle = styled(StyledHandle)`
  left: ${NODE_ICON_WIDTH + NODE_ICON_LEFT_MARGIN + NODE_BORDER_WIDTH}px;
  visibility: hidden;
`;

const StyledTargetHandle = styled(StyledSourceHandle)`
  left: ${NODE_ICON_WIDTH + NODE_ICON_LEFT_MARGIN + NODE_BORDER_WIDTH}px;
  visibility: hidden;
`;

const StyledRightFloatingElementContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: ${({ theme }) => theme.spacing(-4)};
  bottom: 0;
  top: 0;
  transform: translateX(100%);
`;

export const WorkflowDiagramStepNodeBase = ({
  nodeType,
  name,
  variant,
  Icon,
  RightFloatingElement,
  isLeafNode,
}: {
  nodeType: WorkflowDiagramStepNodeData['nodeType'];
  name: string;
  variant: WorkflowDiagramNodeVariant;
  Icon?: React.ReactNode;
  RightFloatingElement?: React.ReactNode;
  isLeafNode: boolean;
}) => {
  return (
    <StyledStepNodeContainer className="workflow-node-container">
      {nodeType !== 'trigger' ? (
        <StyledTargetHandle type="target" position={Position.Top} />
      ) : null}

      <StyledStepNodeType variant="small" nodeVariant={variant}>
        {capitalize(nodeType)}
      </StyledStepNodeType>

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

      {!isLeafNode && (
        <StyledSourceHandle type="source" position={Position.Bottom} />
      )}
    </StyledStepNodeContainer>
  );
};
