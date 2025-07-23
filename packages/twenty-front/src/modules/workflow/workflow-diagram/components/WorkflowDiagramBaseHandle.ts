import styled from '@emotion/styled';
import { Handle } from '@xyflow/react';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';

export const StyledHandle = styled(Handle)`
  height: ${NODE_HANDLE_HEIGHT_PX}px;
  width: ${NODE_HANDLE_WIDTH_PX}px;
  left: ${CREATE_STEP_NODE_WIDTH}px;
`;

export { StyledHandle as WorkflowDiagramBaseHandle };
