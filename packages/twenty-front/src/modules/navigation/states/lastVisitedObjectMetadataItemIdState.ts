import { createState } from 'twenty-ui';
import { localStorageEffect } from '~/utils/recoil-effects';

export const lastVisitedObjectMetadataItemIdState = createState<string | null>({
  key: 'lastVisitedObjectMetadataItemIdState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
