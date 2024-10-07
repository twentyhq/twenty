import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { localStorageEffect } from '~/utils/recoil-effects';

export const lastVisitedViewPerObjectMetadataItemState =
  createComponentState<Record<string, string> | null>({
    key: 'lastVisitedViewPerObjectMetadataItemState',
    defaultValue: null,
    effects: [localStorageEffect()],
  });
