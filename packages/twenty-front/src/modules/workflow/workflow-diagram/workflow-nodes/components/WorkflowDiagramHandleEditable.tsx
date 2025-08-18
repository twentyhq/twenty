import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Handle, type HandleProps } from '@xyflow/react';
import { FeatureFlagKey } from '~/generated/graphql';

type WorkflowDiagramHandleEditableProps = HandleProps & {
  selected: boolean;
};

const HANDLE_SCALE_ON_HOVER = 1.5;

const StyledHandle = styled(Handle, {
  shouldForwardProp: (prop) =>
    prop !== 'disableHoverEffect' && prop !== 'selected',
})<{
  disableHoverEffect: boolean;
  selected: boolean;
}>`
  &.react-flow__handle {
    height: ${NODE_HANDLE_HEIGHT_PX}px;
    width: ${NODE_HANDLE_WIDTH_PX}px;
    border-color: ${({ theme, selected }) =>
      selected ? theme.color.blue : theme.border.color.strong};
    background: ${({ theme, selected }) =>
      selected ? theme.adaptiveColors.blue1 : theme.background.primary};
    transition:
      transform 0.1s ease-out,
      background 0.1s,
      border-color 0.1s;
    z-index: 1;

    ${({ position }) => {
      if (position === 'top') {
        return css`
          transform: translate(-50%, -50%);
          transform-origin: top left;
        `;
      } else if (position === 'bottom') {
        return css`
          transform: translate(-50%, 50%);
          transform-origin: bottom left;
        `;
      }
    }}

    &.connectionindicator {
      cursor: pointer;
    }

    ${({ disableHoverEffect, theme, position }) => {
      if (disableHoverEffect) {
        return undefined;
      }

      return css`
        &:hover {
          background: ${theme.adaptiveColors.blue1} !important;
          border-color: ${theme.color.blue} !important;

          ${position === 'top' &&
          css`
            transform: scale(${HANDLE_SCALE_ON_HOVER}) translate(-50%, -50%);
          `}

          ${position === 'bottom' &&
          css`
            transform: scale(${HANDLE_SCALE_ON_HOVER}) translate(-50%, 50%);
          `}
        }
      `;
    }}
  }
`;

export const WorkflowDiagramHandleEditable = ({
  type,
  position,
  selected,
}: WorkflowDiagramHandleEditableProps) => {
  const isWorkflowBranchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
  );

  return (
    <StyledHandle
      type={type}
      position={position}
      disableHoverEffect={!isWorkflowBranchEnabled}
      selected={selected}
    />
  );
};
