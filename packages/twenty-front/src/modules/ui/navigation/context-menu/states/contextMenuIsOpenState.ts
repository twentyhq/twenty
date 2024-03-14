import { createState } from '@/ui/utilities/state/utils/createState';

export const contextMenuIsOpenState = createState<boolean>({
  key: 'contextMenuIsOpenState',
  defaultValue: false,
});
