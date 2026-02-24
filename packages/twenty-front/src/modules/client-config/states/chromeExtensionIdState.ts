import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const chromeExtensionIdState = createState<string | null | undefined>({
  key: 'chromeExtensionIdState',
  defaultValue: null,
});
