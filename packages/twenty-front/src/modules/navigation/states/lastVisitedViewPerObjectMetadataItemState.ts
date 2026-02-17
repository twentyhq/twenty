import { localStorageEffect } from '~/utils/recoil/localStorageEffect';
import { createState } from '@/ui/utilities/state/utils/createState';

export const lastVisitedViewPerObjectMetadataItemState = createState<Record<
  string,
  string
> | null>({
  key: 'lastVisitedViewPerObjectMetadataItemState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
