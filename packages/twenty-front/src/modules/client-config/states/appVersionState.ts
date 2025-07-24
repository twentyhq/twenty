import { createState } from 'twenty-ui/utilities';

export const appVersionState = createState<string | undefined>({
  key: 'appVersion',
  defaultValue: undefined,
});
