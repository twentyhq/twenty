import { createState } from 'twenty-ui';

export const chromeExtensionIdState = createState<string | null | undefined>({
  key: 'chromeExtensionIdState',
  defaultValue: null,
});
