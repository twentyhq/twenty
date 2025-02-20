import { createState } from '@ui/utilities/state/utils/createState';

export const playgroundApiToken = createState<string>({
  key: 'playgroundApiToken',
  defaultValue: '',
});
