import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { useRecoilCallback } from 'recoil';
import { type IconComponent, IconDotsVertical } from 'twenty-ui/display';

export const useUpdateCommandMenuPageInfo = () => {
  const updateCommandMenuPageInfo = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        pageTitle,
        pageIcon,
      }: {
        pageTitle?: string;
        pageIcon?: IconComponent;
      }) => {
        const commandMenuPageInfo = snapshot
          .getLoadable(commandMenuPageInfoState)
          .getValue();

        const newCommandMenuPageInfo = {
          ...commandMenuPageInfo,
          title: pageTitle ?? commandMenuPageInfo.title ?? '',
          Icon: pageIcon ?? commandMenuPageInfo.Icon ?? IconDotsVertical,
        };

        set(commandMenuPageInfoState, newCommandMenuPageInfo);

        const commandMenuNavigationStack = snapshot
          .getLoadable(commandMenuNavigationStackState)
          .getValue();

        const lastCommandMenuNavigationStackItem =
          commandMenuNavigationStack.at(-1);

        if (!lastCommandMenuNavigationStackItem) {
          return;
        }

        const newCommandMenuNavigationStack = [
          ...commandMenuNavigationStack.slice(0, -1),
          {
            page: lastCommandMenuNavigationStackItem.page,
            pageTitle: newCommandMenuPageInfo.title,
            pageIcon: newCommandMenuPageInfo.Icon,
            pageId: lastCommandMenuNavigationStackItem.pageId,
          },
        ];

        set(commandMenuNavigationStackState, newCommandMenuNavigationStack);
      },
    [],
  );

  return {
    updateCommandMenuPageInfo,
  };
};
