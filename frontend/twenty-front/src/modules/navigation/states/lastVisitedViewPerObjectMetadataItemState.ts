import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastVisitedViewPerObjectMetadataItemState = createAtomState<Record<
  string,
  string
> | null>({
  key: 'lastVisitedViewPerObjectMetadataItemState',
  defaultValue: null,
  useLocalStorage: true,
});
