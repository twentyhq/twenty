import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const lastVisitedViewPerObjectMetadataItemState = createStateV2<Record<
  string,
  string
> | null>({
  key: 'lastVisitedViewPerObjectMetadataItemState',
  defaultValue: null,
  useLocalStorage: true,
});
