import { localStorageEffect } from '~/utils/recoil-effects';
import { createState } from 'twenty-ui/utilities';

export const lastVisitedViewPerObjectMetadataItemState = createState<Record<
  string,
  string
> | null>({
  key: 'lastVisitedViewPerObjectMetadataItemState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
