import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const lastVisitedObjectMetadataItemIdState = createState<string | null>({
  key: 'lastVisitedObjectMetadataItemIdState',
  defaultValue: null,
  useLocalStorage: true,
});
