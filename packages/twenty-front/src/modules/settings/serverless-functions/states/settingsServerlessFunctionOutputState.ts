import { createState } from 'twenty-ui';

type settingsServerlessFunctionOutput = {
  data?: string;
  duration?: number;
  status?: number;
  error?: string;
};

export const DEFAULT_OUTPUT_VALUE =
  'Enter an input above then press "run Function"';

export const settingsServerlessFunctionOutputState =
  createState<settingsServerlessFunctionOutput>({
    key: 'settingsServerlessFunctionOutputState',
    defaultValue: { data: DEFAULT_OUTPUT_VALUE },
  });
