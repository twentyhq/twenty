import { createState } from '@ui/utilities/state/utils/createState';

export const isCurrentUserLoadedState = createState<boolean>({
  key: 'isCurrentUserLoadedState',
  defaultValue: false,
});
