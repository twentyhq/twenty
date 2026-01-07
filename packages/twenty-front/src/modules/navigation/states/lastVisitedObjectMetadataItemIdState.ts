import { localStorageEffect } from '~/utils/recoil/localStorageEffect';
import { createState } from 'twenty-ui/utilities';

export const lastVisitedObjectMetadataItemIdState = createState<string | null>({
  key: 'lastVisitedObjectMetadataItemIdState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
