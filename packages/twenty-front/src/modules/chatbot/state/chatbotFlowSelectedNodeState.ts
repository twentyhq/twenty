import { Node } from '@xyflow/react';
import { createState } from 'twenty-ui/utilities';

export const chatbotFlowSelectedNodeState = createState<Node | undefined>({
  key: 'chatbotFlowSelectedNodeState',
  defaultValue: undefined,
});
