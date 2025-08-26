import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Handle, Position, type HandleProps } from '@xyflow/react';
import { FeatureFlagKey } from '~/generated/graphql';

type WorkflowDiagramHandleSourceProps = {
  selected: boolean;
  hovered?: boolean;
  readOnly?: boolean;
};

const HANDLE_SCALE_ON_HOVER = 1.5;

const StyledHandle = styled(Handle, {
  shouldForwardProp: (prop) =>
    prop !== 'disableHoverEffect' && prop !== 'selected' && prop !== 'hovered',
})<{
  type: HandleProps['type'];
  disableHoverEffect: boolean;
  selected: boolean;
  hovered?: boolean;
}>`
  &.react-flow__handle {
    opacity: ${({ type }) => (type === 'target' ? 0 : 1)};
    height: ${NODE_HANDLE_HEIGHT_PX}px;
    width: ${NODE_HANDLE_WIDTH_PX}px;
    border-color: ${({ theme, selected, hovered, disableHoverEffect }) =>
      selected
        ? theme.color.blue
        : hovered && !disableHoverEffect
          ? theme.font.color.light
          : theme.border.color.strong};
    background: ${({ theme, selected }) =>
      selected ? theme.adaptiveColors.blue1 : theme.background.primary};
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

      return css`
        &:hover {
          background: ${theme.adaptiveColors.blue1} !important;
          border-color: ${theme.color.blue} !important;
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
}: WorkflowDiagramHandleSourceProps) => {
  const isWorkflowBranchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
  );

  return (
    <StyledHandle
      type={'source'}
      position={Position.Bottom}
      disableHoverEffect={!isWorkflowBranchEnabled || readOnly}
      selected={selected}
      hovered={hovered}
    />
  );
};
