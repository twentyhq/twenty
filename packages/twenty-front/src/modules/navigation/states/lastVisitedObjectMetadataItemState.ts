import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { localStorageEffect } from '~/utils/recoil-effects';

export const lastVisitedObjectMetadataItemState = createComponentState<Record<
  string,
  string
> | null>({
  key: 'lastVisitedObjectMetadataItemState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
