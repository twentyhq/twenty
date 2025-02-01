import { RefObject } from 'react';
import { createState } from "twenty-shared";

export const workflowReactFlowRefState =
  createState<RefObject<HTMLDivElement> | null>({
    key: 'workflowReactFlowRefState',
    defaultValue: null,
  });
