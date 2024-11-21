import { createState } from 'twenty-ui';
import { RefObject } from 'react';

export const workflowReactFlowRefState =
  createState<RefObject<HTMLDivElement> | null>({
    key: 'workflowReactFlowRefState',
    defaultValue: null,
  });
