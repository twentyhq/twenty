import { NODE_BORDER_WIDTH } from '@/workflow/workflow-diagram/constants/NodeBorderWidth';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { NODE_ICON_LEFT_MARGIN } from '@/workflow/workflow-diagram/constants/NodeIconLeftMargin';
import { NODE_ICON_WIDTH } from '@/workflow/workflow-diagram/constants/NodeIconWidth';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { capitalize, isDefined } from 'twenty-shared';
import { Label, OverflowingTextWithTooltip } from 'twenty-ui';

type Variant = 'placeholder';

const StyledStepNodeContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding-block: ${({ theme }) => theme.spacing(3)};
`;

const StyledStepNodeType = styled(Label)`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm} 0 0;

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
  border: ${NODE_BORDER_WIDTH}px solid
    ${({ theme }) => theme.border.color.medium};
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
  font-size: 13px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  column-gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ variant, theme }) =>
    variant === 'placeholder'
      ? theme.font.color.extraLight
      : theme.font.color.primary};
  max-width: 200px;
`;

export const StyledHandle = styled(Handle)`
  background-color: ${({ theme }) => theme.grayScale.gray25};
  border: none;
  width: ${NODE_HANDLE_WIDTH_PX}px;
  height: ${NODE_HANDLE_HEIGHT_PX}px;
`;

const StyledSourceHandle = styled(StyledHandle)`
  background-color: ${({ theme }) => theme.border.color.strong};
  left: ${NODE_ICON_WIDTH + NODE_ICON_LEFT_MARGIN + NODE_BORDER_WIDTH}px;
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

      <StyledStepNodeType variant="small">
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

      <StyledSourceHandle type="source" position={Position.Bottom} />
    </StyledStepNodeContainer>
  );
};
