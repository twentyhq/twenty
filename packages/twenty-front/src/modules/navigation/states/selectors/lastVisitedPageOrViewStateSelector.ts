import { lastVisitedPageOrViewState } from '@/navigation/states/lastVisitedPageOrViewState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { isNull } from '@sniptt/guards';

export const lastVisitedPageOrViewStateSelector =
  createComponentSelector<Record<string, string> | null>({
    key: 'lastVisitedPageOrViewStateSelector',
    get:
      ({ scopeId }: { scopeId: string }) =>
      ({ get }) =>
        get(lastVisitedPageOrViewState({ scopeId })),
    set:
      ({ scopeId }: { scopeId: string }) =>
      ({ set, get }, newValue) => {
        const currentState = get(lastVisitedPageOrViewState({ scopeId }));
        if (isNull(currentState)) {
          set(lastVisitedPageOrViewState({ scopeId }), newValue);
        } else {
          set(lastVisitedPageOrViewState({ scopeId }), {
            ...currentState,
            ...newValue,
          });
        }
      },
  });
