import { RefObject } from 'react';
import { createState } from 'twenty-ui/utilities';

export const workflowReactFlowRefState =
  createState<RefObject<HTMLDivElement> | null>({
    key: 'workflowReactFlowRefState',
    defaultValue: null,
  });
