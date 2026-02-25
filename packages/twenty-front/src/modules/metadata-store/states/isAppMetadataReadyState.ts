import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isAppMetadataReadyState = createAtomState<boolean>({
  key: 'isAppMetadataReadyState',
  defaultValue: false,
});
