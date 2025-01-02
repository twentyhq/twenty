import { createState } from '@ui/utilities/state/utils/createState';
import { RefObject } from 'react';

export const workflowReactFlowRefState =
  createState<RefObject<HTMLDivElement> | null>({
    key: 'workflowReactFlowRefState',
    defaultValue: null,
  });
