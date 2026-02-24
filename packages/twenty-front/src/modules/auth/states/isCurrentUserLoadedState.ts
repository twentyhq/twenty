import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isCurrentUserLoadedState = createState<boolean>({
  key: 'isCurrentUserLoadedState',
  defaultValue: false,
});
