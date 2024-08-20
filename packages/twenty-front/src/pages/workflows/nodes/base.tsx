import styled from '@emotion/styled';

import { Handle } from '@xyflow/react';

export type WorkflowDiagramStepNodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
  label: string;
};

export type WorkflowDiagramCreateStepNodeData = Record<string, never>;

export type WorkflowDiagramNodeData =
  | WorkflowDiagramStepNodeData
  | WorkflowDiagramCreateStepNodeData;

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;
