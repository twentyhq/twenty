import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { appFocusHistoryState } from '../states/appFocusHistoryState';
import { appFocusState } from '../states/appFocusState';
import { AppFocus } from '../types/AppFocus';

export function useRemoveAppFocus() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (appFocusToRemove: AppFocus) => {
        const appFocus = await snapshot.getPromise(appFocusState);
        const appFocusHistory = await snapshot.getPromise(appFocusHistoryState);

        if (appFocusHistory.length < 1) {
          set(appFocusState, 'none');
          set(appFocusHistoryState, ['none'] as AppFocus[]);

          return;
        }

        if (appFocusHistory.length === 1) {
          if (appFocus !== 'none') {
            set(appFocusState, 'none');
          }

          return;
        }

        const previousAppFocus = appFocusHistory[appFocusHistory.length - 2];

        if (
          previousAppFocus === appFocusToRemove ||
          appFocusToRemove !== appFocus
        ) {
          return;
        }

        set(appFocusState, previousAppFocus);

        set(
          appFocusHistoryState,
          produce(appFocusHistory, (draft) => {
            return draft.filter((appFocus) => appFocus !== appFocusToRemove);
          }),
        );
      },
    [],
  );
}
