import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Handle, Position, type HandleProps } from '@xyflow/react';
import { FeatureFlagKey } from '~/generated/graphql';

type WorkflowDiagramHandleSourceProps = {
  selected: boolean;
  hovered?: boolean;
  readOnly?: boolean;
  runStatus?: WorkflowRunStepStatus;
};

const HANDLE_SCALE_ON_HOVER = 1.5;

const StyledHandle = styled(Handle, {
  shouldForwardProp: (prop) =>
    prop !== 'disableHoverEffect' &&
    prop !== 'selected' &&
    prop !== 'hovered' &&
    prop !== 'runStatus',
})<{
  type: HandleProps['type'];
  disableHoverEffect: boolean;
  selected: boolean;
  hovered?: boolean;
  runStatus?: WorkflowRunStepStatus;
}>`
  &.react-flow__handle {
    opacity: ${({ type }) => (type === 'target' ? 0 : 1)};
    height: ${NODE_HANDLE_HEIGHT_PX}px;
    width: ${NODE_HANDLE_WIDTH_PX}px;

    ${({ theme, selected, hovered, disableHoverEffect, runStatus }) => {
      if (!selected) {
        return css`
          background: ${theme.background.primary};
          border-color: ${hovered && !disableHoverEffect
            ? theme.font.color.light
            : theme.border.color.strong};
        `;
      }

      const colors = getWorkflowDiagramColors({ theme, runStatus });

      return css`
        background: ${colors.selected.background};
        border-color: ${colors.selected.borderColor};
      `;
    }}
    transition:
      transform 0.1s ease-out,
      background 0.1s,
      border-color 0.1s;
    z-index: 1;

    transform: translate(-50%, 50%);
    transform-origin: bottom left;

    &.connectionindicator {
      cursor: pointer;
    }

    ${({ disableHoverEffect, theme }) => {
      if (disableHoverEffect) {
        return undefined;
      }

      const colors = getWorkflowDiagramColors({ theme });

      return css`
        &:hover {
          background: ${colors.selected.background} !important;
          border-color: ${colors.selected.borderColor} !important;
          transform: scale(${HANDLE_SCALE_ON_HOVER}) translate(-50%, 50%);
        }
      `;
    }}
  }
`;

export const WorkflowDiagramHandleSource = ({
  selected,
  hovered = false,
  readOnly = false,
  runStatus,
}: WorkflowDiagramHandleSourceProps) => {
  const isWorkflowBranchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
  );

  return (
    <StyledHandle
      type="source"
      position={Position.Bottom}
      disableHoverEffect={!isWorkflowBranchEnabled || readOnly}
      selected={selected}
      hovered={hovered}
      runStatus={runStatus}
    />
  );
};
