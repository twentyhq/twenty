import { createState } from '@/ui/utilities/state/utils/createState';

export const selectedRecordsComponentState = createState<Number>({
  key: 'selectedRecordsComponentState',
  defaultValue: 0,
});
