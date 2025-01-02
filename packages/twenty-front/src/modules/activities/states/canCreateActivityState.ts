import { createState } from '@ui/utilities/state/utils/createState';

export const canCreateActivityState = createState<boolean>({
  key: 'canCreateActivityState',
  defaultValue: false,
});
