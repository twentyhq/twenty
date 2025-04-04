import { createState } from 'twenty-ui/utilities';
export const canCreateActivityState = createState<boolean>({
  key: 'canCreateActivityState',
  defaultValue: false,
});
