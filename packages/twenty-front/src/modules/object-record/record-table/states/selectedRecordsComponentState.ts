import { createState } from '@/ui/utilities/state/utils/createState';

export const selectedRecordsComponentState = createState<number>({
  key: 'selectedRecordsComponentState',
  defaultValue: 0,
});
