import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const loadedViewsObjectMetadataIdsState = createAtomState<string[]>({
  key: 'loadedViewsObjectMetadataIdsState',
  defaultValue: [],
});
