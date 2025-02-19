import { createState } from '@ui/utilities/state/utils/createState';

export const commandMenuSearchState = createState<string>({
  key: 'command-menu/commandMenuSearchState',
  defaultValue: '',
});
