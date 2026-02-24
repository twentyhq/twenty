import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const lastVisitedViewPerObjectMetadataItemState = createState<Record<
  string,
  string
> | null>({
  key: 'lastVisitedViewPerObjectMetadataItemState',
  defaultValue: null,
  useLocalStorage: true,
});
