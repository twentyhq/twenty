import { createState } from "twenty-shared";

export const rightDrawerCloseEventState = createState<Event | null>({
  key: 'rightDrawerCloseEventState',
  defaultValue: null,
});
