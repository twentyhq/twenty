import { createState } from 'twenty-ui';

export const rightDrawerCloseEventState = createState<Event | null>({
  key: 'rightDrawerCloseEventState',
  defaultValue: null,
});
