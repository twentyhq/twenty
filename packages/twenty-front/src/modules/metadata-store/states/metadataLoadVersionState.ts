import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const metadataLoadVersionState = createAtomState<number>({
  key: 'metadataLoadVersionState',
  defaultValue: 0,
});
