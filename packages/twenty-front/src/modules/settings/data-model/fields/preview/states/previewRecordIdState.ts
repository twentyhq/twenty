import { createState } from 'twenty-ui';

export const previewRecordIdState = createState<string | null>({
  key: 'previewRecordId',
  defaultValue: null,
});
