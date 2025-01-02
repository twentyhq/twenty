import { createState } from '@ui/utilities/state/utils/createState';

export const isRemoveSortingModalOpenState = createState<boolean>({
  key: 'isRemoveSortingModalOpenState',
  defaultValue: false,
});
