import { useCommandMenuUpdateNavigationMorphItemsByPage } from '@/command-menu/hooks/useCommandMenuUpdateNavigationMorphItemsByPage';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

import { msg, t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { IconArrowMerge } from 'twenty-ui/display';
import { v4 } from 'uuid';

type UseOpenMergeRecordsPageInCommandMenuProps = {
  objectNameSingular: string;
  objectRecordIds: string[];
};

export const useOpenMergeRecordsPageInCommandMenu = ({
  objectNameSingular,
  objectRecordIds,
}: UseOpenMergeRecordsPageInCommandMenuProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { updateCommandMenuNavigationMorphItemsByPage } =
    useCommandMenuUpdateNavigationMorphItemsByPage();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular,
    filter: {
      id: {
        in: objectRecordIds,
      },
    },
  });

  const openMergeRecordsPageInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return async () => {
        const pageId = v4();

        set(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId: pageId,
          }),
          objectMetadataItem.id,
        );

        await updateCommandMenuNavigationMorphItemsByPage({
          pageId,
          objectMetadataId: objectMetadataItem.id,
          objectRecordIds,
        });
        const { records } = await findManyRecordsLazy();
        upsertRecordsInStore({ partialRecords: records ?? [] });

        navigateCommandMenu({
          page: CommandMenuPages.MergeRecords,
          pageTitle: t(msg`Merge records`),
          pageIcon: IconArrowMerge,
          pageId,
        });
      };
    },
    [
      objectMetadataItem.id,
      objectRecordIds,
      findManyRecordsLazy,
      upsertRecordsInStore,
      navigateCommandMenu,
      updateCommandMenuNavigationMorphItemsByPage,
    ],
  );

  return {
    openMergeRecordsPageInCommandMenu,
  };
};
