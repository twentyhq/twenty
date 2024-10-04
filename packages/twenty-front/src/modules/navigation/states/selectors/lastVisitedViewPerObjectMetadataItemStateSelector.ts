import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { isDefined } from 'twenty-ui';

export const lastVisitedViewPerObjectMetadataItemStateSelector =
  createComponentSelector<Record<string, string> | null>({
    key: 'lastVisitedViewPerObjectMetadataItemStateSelector',
    get:
      ({ scopeId }: { scopeId: string }) =>
      ({ get }) => {
        const state = get(
          lastVisitedViewPerObjectMetadataItemState({ scopeId }),
        );

        if (isDefined(state?.['last_visited_object'])) {
          const { last_visited_object: _last_visited_object, ...rest } = state;
          return rest;
        }

        return state;
      },
    set:
      ({ scopeId }: { scopeId: string }) =>
      ({ set, get }, newValue) => {
        const currentLastVisitedViewPerObjectMetadataItems = get(
          lastVisitedViewPerObjectMetadataItemStateSelector({ scopeId }),
        );

        set(lastVisitedViewPerObjectMetadataItemState({ scopeId }), {
          ...currentLastVisitedViewPerObjectMetadataItems,
          ...newValue,
        });
      },
  });
