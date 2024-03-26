import { createState } from '@/ui/utilities/state/utils/createState';

export const isDeleteRecordsModalOpenState = createState<boolean>({
  key: 'IsDeleteRecordsModalOpenState',
  defaultValue: false,
});
