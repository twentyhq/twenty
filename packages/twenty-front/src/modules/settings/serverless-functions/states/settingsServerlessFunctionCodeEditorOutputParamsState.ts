import { createState } from 'twenty-ui';

export const settingsServerlessFunctionCodeEditorOutputParamsState =
  createState<{ language: string; height: number }>({
    key: 'settingsServerlessFunctionCodeEditorOutputParamsState',
    defaultValue: { language: 'plaintext', height: 64 },
  });
