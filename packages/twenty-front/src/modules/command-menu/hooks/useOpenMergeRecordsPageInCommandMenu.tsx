import { useCommandMenuUpdateNavigationMorphItemsByPage } from '@/command-menu/hooks/useCommandMenuUpdateNavigationMorphItemsByPage';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { msg, t } from '@lingui/core/macro';
import { IconArrowMerge } from 'twenty-ui/display';

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

  const openMergeRecordsPageInCommandMenu = async () => {
    await updateCommandMenuNavigationMorphItemsByPage({
      pageId: CommandMenuPages.MergeRecords,
      objectMetadataId: objectMetadataItem.id,
      objectRecordIds,
    });
    const { records } = await findManyRecordsLazy();
    upsertRecordsInStore(records ?? []);

    navigateCommandMenu({
      page: CommandMenuPages.MergeRecords,
      pageTitle: t(msg`Merge records`),
      pageIcon: IconArrowMerge,
      pageId: CommandMenuPages.MergeRecords,
    });
  };

  return {
    openMergeRecordsPageInCommandMenu,
  };
};
