import { Handle, HandleProps } from '@xyflow/react';
import styled from '@emotion/styled';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';

type WorkflowDiagramBaseHandleProps = HandleProps & { isVisible?: boolean };

const HANDLE_SCALE_ON_HOVER = 1.5;

const TRANSLATE_PERCENT = 33.33;

const StyledHandle = styled(Handle)<WorkflowDiagramBaseHandleProps>`
  // We need !important to avoid passing style with the Handle.style property
  height: ${NODE_HANDLE_HEIGHT_PX}px !important;
  width: ${NODE_HANDLE_WIDTH_PX}px !important;
  border-color: ${({ theme }) => theme.border.color.strong} !important;
  background: ${({ theme }) => theme.background.primary} !important;
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

  &:hover {
    border-color: ${({ theme }) => theme.font.color.light} !important;
    background: ${({ theme }) => theme.background.secondary} !important;

    ${({ position }) => {
      switch (position) {
        case 'top':
          return `transform: scale(${HANDLE_SCALE_ON_HOVER}) translate(${-TRANSLATE_PERCENT}%, ${-TRANSLATE_PERCENT}%) !important;`;
        case 'bottom':
          return `transform: scale(${HANDLE_SCALE_ON_HOVER}) translate(${-TRANSLATE_PERCENT}%, ${TRANSLATE_PERCENT * 2}%) !important;`;
        default:
          return `transform: scale(${HANDLE_SCALE_ON_HOVER}) !important;`;
      }
    }}
  }
`;

export const WorkflowDiagramBaseHandle = ({
  type,
  position,
  isVisible = true,
}: WorkflowDiagramBaseHandleProps) => {
  return (
    <StyledHandle
      type={type}
      position={position}
      style={{ opacity: isVisible ? 1 : 0 }}
    />
  );
};
