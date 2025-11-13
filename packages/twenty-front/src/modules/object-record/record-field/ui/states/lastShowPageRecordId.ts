import { createState } from 'twenty-ui/utilities';

export const lastShowPageRecordIdState = createState<string | null>({
  key: 'lastShowPageRecordIdState',
  defaultValue: null,
});
