import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const lastShowPageRecordIdState = createState<string | null>({
  key: 'lastShowPageRecordIdState',
  defaultValue: null,
});
