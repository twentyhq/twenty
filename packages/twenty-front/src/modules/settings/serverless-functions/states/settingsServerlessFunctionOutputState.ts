import { createState } from 'twenty-ui';

export const settingsServerlessFunctionOutputState = createState<string>({
  key: 'settingsServerlessFunctionOutputState',
  defaultValue: 'Enter an input above then press "run Function"',
});
