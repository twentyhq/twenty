import { createState } from "twenty-shared";

export const recordIndexIsCompactModeActiveState = createState<boolean>({
  key: 'recordIndexIsCompactModeActiveState',
  defaultValue: false,
});
