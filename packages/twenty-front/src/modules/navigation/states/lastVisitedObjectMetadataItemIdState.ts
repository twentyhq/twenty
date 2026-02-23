import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const lastVisitedObjectMetadataItemIdState = createStateV2<
  string | null
>({
  key: 'lastVisitedObjectMetadataItemIdState',
  defaultValue: null,
  useLocalStorage: true,
});
