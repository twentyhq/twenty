import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { msg, t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { IconEdit } from 'twenty-ui/display';
import { v4 } from 'uuid';

type UseOpenUpdateMultipleRecordsPageInCommandMenuProps = {
  objectNameSingular: string;
};

export const useOpenUpdateMultipleRecordsPageInCommandMenu = ({
  objectNameSingular,
}: UseOpenUpdateMultipleRecordsPageInCommandMenuProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openUpdateMultipleRecordsPageInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return async () => {
        const pageId = v4();

        set(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId: pageId,
          }),
          objectMetadataItem.id,
        );

        navigateCommandMenu({
          page: CommandMenuPages.UpdateRecords,
          pageTitle: t(msg`Update records`),
          pageIcon: IconEdit,
          pageId,
        });
      };
    },
    [objectMetadataItem.id, navigateCommandMenu],
  );

  return {
    openUpdateMultipleRecordsPageInCommandMenu,
  };
};
