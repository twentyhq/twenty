import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const lastVisitedObjectMetadataItemIdStateSelector =
  createComponentSelector<string | null>({
    key: 'lastVisitedObjectMetadataItemIdStateSelector',
    get:
      ({ scopeId }: { scopeId: string }) =>
      ({ get }) => {
        const state = get(lastVisitedObjectMetadataItemIdState({ scopeId }));
        return state?.['last_visited_object']
          ? state['last_visited_object']
          : null;
      },
    set:
      ({ scopeId }: { scopeId: string }) =>
      ({ set }, newValue) => {
        set(lastVisitedObjectMetadataItemIdState({ scopeId }), {
          ...(typeof newValue === 'string' && {
            last_visited_object: newValue,
          }),
        });
      },
  });
