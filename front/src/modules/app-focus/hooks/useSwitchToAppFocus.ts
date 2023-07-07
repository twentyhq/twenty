import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { appFocusHistoryState } from '../states/appFocusHistoryState';
import { appFocusState } from '../states/appFocusState';
import { AppFocus } from '../types/AppFocus';

export function useSwitchToAppFocus() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (newAppFocus: AppFocus) => {
        const appFocus = await snapshot.getPromise(appFocusState);
        const appFocusHistory = await snapshot.getPromise(appFocusHistoryState);

        console.log({ appFocus, appFocusHistory, newAppFocus });

        if (newAppFocus === appFocus) {
          return;
        }

        const lastAppFocus =
          appFocusHistory.length > 0
            ? appFocusHistory[appFocusHistory.length - 2]
            : null;

        if (lastAppFocus === newAppFocus) {
          return;
        }

        set(appFocusState, newAppFocus);
        set(
          appFocusHistoryState,
          produce(appFocusHistory, (draft) => {
            draft.push(newAppFocus);
          }),
        );
      },
    [],
  );
}
