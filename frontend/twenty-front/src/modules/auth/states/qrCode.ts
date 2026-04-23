import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const qrCodeState = createAtomState<string | null>({
  key: 'qrCodeState',
  defaultValue: null,
});
