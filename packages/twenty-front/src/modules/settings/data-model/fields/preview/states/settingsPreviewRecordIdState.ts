import { createState } from 'twenty-ui';

export const settingsPreviewRecordIdState = createState<string | null>({
  key: 'settingsPreviewRecordIdState',
  defaultValue: null,
});
