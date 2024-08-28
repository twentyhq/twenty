import { createState } from 'twenty-ui';

export const createStepFromParentStepIdState = createState<string | undefined>({
  key: 'createStepFromParentStepIdState',
  defaultValue: undefined,
});
