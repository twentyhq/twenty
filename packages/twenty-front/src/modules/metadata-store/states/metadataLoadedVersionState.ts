import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const metadataLoadedVersionState = createAtomState<number>({
  key: 'metadataLoadedVersionState',
  defaultValue: 0,
});
