import { createState } from "twenty-shared";

export const isSoftFocusUsingMouseState = createState<boolean>({
  key: 'isSoftFocusUsingMouseState',
  defaultValue: false,
});
