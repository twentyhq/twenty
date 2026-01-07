import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { IconMail } from 'twenty-ui/display';

export const useOpenEmailThreadInCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openEmailThreadInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (emailThreadId: string) => {
        const pageComponentInstanceId = v4();

        set(
          viewableRecordIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          emailThreadId,
        );

        // TODO: Uncomment this once we need to show the thread title in the navigation
        // const objectMetadataItem = snapshot
        //   .getLoadable(objectMetadataItemsState)
        //   .getValue()
        //   .find(
        //     ({ nameSingular }) =>
        //       nameSingular === CoreObjectNameSingular.MessageThread,
        //   );

        // set(
        //   commandMenuNavigationMorphItemsState,
        //   new Map([
        //     ...snapshot
        //       .getLoadable(commandMenuNavigationMorphItemsState)
        //       .getValue(),
        //     [
        //       pageComponentInstanceId,
        //       {
        //         objectMetadataId: objectMetadataItem?.id,
        //         recordId: emailThreadId,
        //       },
        //     ],
        //   ]),
        // );

        navigateCommandMenu({
          page: CommandMenuPages.ViewEmailThread,
          pageTitle: t`Email Thread`,
          pageIcon: IconMail,
          pageId: pageComponentInstanceId,
        });
      };
    },
    [navigateCommandMenu],
  );

  return {
    openEmailThreadInCommandMenu,
  };
};
