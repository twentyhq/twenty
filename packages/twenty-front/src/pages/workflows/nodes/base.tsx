import styled from '@emotion/styled';

import { Handle } from '@xyflow/react';

export type WorkflowStepNodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
  label: string;
};

export type WorkflowCreateStepNodeData = Record<string, never>;

export type WorkflowNodeData =
  | WorkflowStepNodeData
  | WorkflowCreateStepNodeData;

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;
