import { createState } from 'twenty-ui/utilities';
export const workflowLastCreatedStepIdState = createState<string | undefined>({
  key: 'workflowLastCreatedStepIdState',
  defaultValue: undefined,
});
