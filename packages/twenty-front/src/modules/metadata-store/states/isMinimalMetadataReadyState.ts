import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isMinimalMetadataReadyState = createAtomState<boolean>({
  key: 'isMinimalMetadataReadyState',
  defaultValue: false,
});
