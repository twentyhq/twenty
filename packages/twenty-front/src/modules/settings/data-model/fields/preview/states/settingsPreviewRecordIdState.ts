import { createState } from "twenty-shared";

export const settingsPreviewRecordIdState = createState<string | null>({
  key: 'settingsPreviewRecordIdState',
  defaultValue: null,
});
