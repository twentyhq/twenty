import { createState } from "twenty-shared";

export const isDebugModeState = createState<boolean>({
  key: 'isDebugModeState',
  defaultValue: false,
});
