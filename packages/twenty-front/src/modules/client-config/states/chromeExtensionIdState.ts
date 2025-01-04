import { createState } from '@ui/utilities/state/utils/createState';

export const chromeExtensionIdState = createState<string | null | undefined>({
  key: 'chromeExtensionIdState',
  defaultValue: null,
});
