import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const metadataVersionState = createAtomState<number | null>({
  key: 'metadataVersionState',
  defaultValue: null,
});
