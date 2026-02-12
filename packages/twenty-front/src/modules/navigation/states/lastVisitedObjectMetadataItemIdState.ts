import { localStorageEffect } from '~/utils/recoil/localStorageEffect';
import { createState } from '@/ui/utilities/state/utils/createState';

export const lastVisitedObjectMetadataItemIdState = createState<string | null>({
  key: 'lastVisitedObjectMetadataItemIdState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
