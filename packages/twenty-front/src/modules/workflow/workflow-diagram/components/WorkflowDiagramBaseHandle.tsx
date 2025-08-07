import { Handle, HandleProps } from '@xyflow/react';
import styled from '@emotion/styled';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

type WorkflowDiagramBaseHandleProps = HandleProps & {
  isVisible?: boolean;
  disableHoverEffect?: boolean;
  selected?: boolean;
};

const HANDLE_SCALE_ON_HOVER = 1.5;

const TRANSLATE_PERCENT = 33.33;

const StyledHandle = styled(Handle, {
  shouldForwardProp: (prop) =>
    !['disableHoverEffect', 'selected'].includes(prop),
})<WorkflowDiagramBaseHandleProps>`
  // We need !important to avoid passing style with the Handle.style property
  height: ${NODE_HANDLE_HEIGHT_PX}px !important;
  width: ${NODE_HANDLE_WIDTH_PX}px !important;
  border-color: ${({ theme, selected }) =>
    selected ? theme.color.blue : theme.border.color.strong} !important;
  background: ${({ theme, selected }) =>
    selected
      ? theme.adaptiveColors.blue1
      : theme.background.primary} !important;
  transition:
    transform 0.1s ease-out,
    background 0.1s,
    border-color 0.1s !important;
  z-index: 1 !important;

  ${({ position }) => {
    switch (position) {
      case 'top':
        return `top: 19px !important;`;
      case 'bottom':
        return `top: 47px !important;`;
      default:
        return '';
    }
  }}

  ${({ disableHoverEffect, theme, position, selected }) => {
    if (disableHoverEffect === true) {
      return '';
    }

    let transform = `transform: scale(${HANDLE_SCALE_ON_HOVER}) !important;`;

    if (position === 'top') {
      transform = `transform: scale(${HANDLE_SCALE_ON_HOVER}) translate(${-TRANSLATE_PERCENT}%, ${-TRANSLATE_PERCENT}%) !important;`;
    } else if (position === 'bottom') {
      transform = `transform: scale(${HANDLE_SCALE_ON_HOVER}) translate(${-TRANSLATE_PERCENT}%, ${TRANSLATE_PERCENT * 2}%) !important;`;
    }

    return `
    &:hover {
      border-color: ${selected ? theme.color.blue : theme.font.color.light} !important;
      background: ${selected ? theme.adaptiveColors.blue1 : theme.background.primary} !important;
      ${transform}
    }
  `;
  }}
`;

export const WorkflowDiagramBaseHandle = ({
  type,
  position,
  isVisible = true,
  selected = false,
}: WorkflowDiagramBaseHandleProps) => {
  const isWorkflowBranchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
  );

  return (
    <StyledHandle
      type={type}
      position={position}
      style={{ opacity: isVisible ? 1 : 0 }}
      disableHoverEffect={!isWorkflowBranchEnabled}
      selected={selected}
    />
  );
};
