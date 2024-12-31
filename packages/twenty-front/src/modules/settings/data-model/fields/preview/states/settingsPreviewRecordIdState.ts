import { createState } from '@ui/utilities/state/utils/createState';

export const settingsPreviewRecordIdState = createState<string | null>({
  key: 'settingsPreviewRecordIdState',
  defaultValue: null,
});
