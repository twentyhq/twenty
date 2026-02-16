import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSyncCommandMenuTitle = () => {
  const syncCommandMenuTitle = useRecoilCallback(
    ({ snapshot, set }) =>
      (title: string | null) => {
        if (!isNonEmptyString(title)) {
          return;
        }

        const pageInfo = snapshot
          .getLoadable(commandMenuPageInfoState)
          .getValue();

        set(commandMenuPageInfoState, { ...pageInfo, title });

        const navigationStack = snapshot
          .getLoadable(commandMenuNavigationStackState)
          .getValue();

        const lastItem = navigationStack.at(-1);

        if (isDefined(lastItem)) {
          set(commandMenuNavigationStackState, [
            ...navigationStack.slice(0, -1),
            { ...lastItem, pageTitle: title },
          ]);
        }
      },
    [],
  );

  return { syncCommandMenuTitle };
};
