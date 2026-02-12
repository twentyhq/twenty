import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const chromeExtensionIdState = createStateV2<string | null | undefined>({
  key: 'chromeExtensionIdState',
  defaultValue: null,
});
