import { lastVisitedObjectMetadataItemState } from '@/navigation/states/lastVisitedObjectMetadataItemState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const lastVisitedObjectMetadataItemStateSelector =
  createComponentSelector<string | null>({
    key: 'lastVisitedObjectMetadataItemStateSelector',
    get:
      ({ scopeId }: { scopeId: string }) =>
      ({ get }) => {
        const state = get(lastVisitedObjectMetadataItemState({ scopeId }));
        return state?.['last_visited_object']
          ? state['last_visited_object']
          : null;
      },
    set:
      ({ scopeId }: { scopeId: string }) =>
      ({ set }, newValue) => {
        set(lastVisitedObjectMetadataItemState({ scopeId }), {
          ...(typeof newValue === 'string' && {
            last_visited_object: newValue,
          }),
        });
      },
  });
