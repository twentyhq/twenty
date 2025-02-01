import { createState } from "twenty-shared";

export const commandMenuSearchState = createState<string>({
  key: 'command-menu/commandMenuSearchState',
  defaultValue: '',
});
