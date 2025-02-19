import { createState } from '@ui/utilities/state/utils/createState';

export const workflowLastCreatedStepIdState = createState<string | undefined>({
  key: 'workflowLastCreatedStepIdState',
  defaultValue: undefined,
});
