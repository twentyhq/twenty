import { createState } from 'twenty-ui';

export const createStepFromStepState = createState<string | undefined>({
  key: 'createStepFromStepState',
  defaultValue: undefined,
});
