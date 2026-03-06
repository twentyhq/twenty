import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import { Handle, Position, type HandleProps } from '@xyflow/react';
import { useMemo, type CSSProperties } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const HANDLE_SCALE_ON_HOVER = 1.5;

const StyledHandleContainer = styled.div`
  & .react-flow__handle {
    height: ${NODE_HANDLE_HEIGHT_PX}px;
    width: ${NODE_HANDLE_WIDTH_PX}px;
    opacity: var(--handle-opacity, 1);
    background: var(--handle-bg);
    border-color: var(--handle-border-color);
    transform: var(--handle-transform);
    transform-origin: var(--handle-transform-origin);

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(100% + ${themeCssVariables.spacing[4]});
      height: calc(100% + ${themeCssVariables.spacing[4]});
    }

    transition:
      transform 0.1s ease-out,
      background 0.1s,
      border-color 0.1s;
    z-index: 1;

    &.connectionindicator {
      cursor: pointer;
    }

    &:hover {
      background: var(--handle-hover-bg, var(--handle-bg)) !important;
      border-color: var(
        --handle-hover-border-color,
        var(--handle-border-color)
      ) !important;
      transform: var(--handle-hover-transform, var(--handle-transform));
    }
  }
`;

type WorkflowDiagramHandleSourceProps = {
  id: string;
  type: HandleProps['type'];
  position: Position;
  selected: boolean;
  hovered?: boolean;
  disableHoverEffect?: boolean;
  runStatus?: WorkflowRunStepStatus;
};

export const WorkflowDiagramHandleSource = ({
  id,
  type,
  position,
  selected,
  hovered,
  disableHoverEffect,
  runStatus,
}: WorkflowDiagramHandleSourceProps) => {
  const dynamicStyles = useMemo(() => {
    const isRight = position === Position.Right;
    const transform = isRight ? 'translate(50%, -50%)' : 'translate(-50%, 50%)';
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    const transformOrigin = isRight ? 'top right' : 'bottom left';

    let bg: string;
    let borderColor: string;

    if (selected) {
      const colors = getWorkflowDiagramColors({ runStatus });
      bg = colors.selected.background;
      borderColor = colors.selected.borderColor;
    } else {
      bg = themeCssVariables.background.primary;
      borderColor =
        hovered && disableHoverEffect !== true
          ? themeCssVariables.font.color.light
          : themeCssVariables.border.color.strong;
    }

    const styles: Record<string, string> = {
      '--handle-opacity': type === 'target' ? '0' : '1',
      '--handle-bg': bg,
      '--handle-border-color': borderColor,
      '--handle-transform': transform,
      '--handle-transform-origin': transformOrigin,
    };

    if (disableHoverEffect !== true) {
      const hoverColors = getWorkflowDiagramColors({});
      styles['--handle-hover-bg'] = hoverColors.selected.background;
      styles['--handle-hover-border-color'] = hoverColors.selected.borderColor;
      styles['--handle-hover-transform'] =
        `scale(${HANDLE_SCALE_ON_HOVER}) ${transform}`;
    }

    return styles as CSSProperties;
  }, [position, selected, hovered, disableHoverEffect, runStatus, type]);

  return (
    <StyledHandleContainer>
      <Handle id={id} type={type} position={position} style={dynamicStyles} />
    </StyledHandleContainer>
  );
};
