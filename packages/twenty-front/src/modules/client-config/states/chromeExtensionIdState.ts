import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const chromeExtensionIdState = createAtomState<
  string | null | undefined
>({
  key: 'chromeExtensionIdState',
  defaultValue: null,
});
