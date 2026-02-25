import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastVisitedObjectMetadataItemIdState = createAtomState<
  string | null
>({
  key: 'lastVisitedObjectMetadataItemIdState',
  defaultValue: null,
  useLocalStorage: true,
});
