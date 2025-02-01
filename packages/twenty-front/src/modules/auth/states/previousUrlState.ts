import { createState } from "twenty-shared";

export const previousUrlState = createState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
