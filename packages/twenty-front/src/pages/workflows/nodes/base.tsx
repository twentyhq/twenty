import styled from '@emotion/styled';

import { Handle } from '@xyflow/react';

export type WorkflowNodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
  label: string;
};

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;
