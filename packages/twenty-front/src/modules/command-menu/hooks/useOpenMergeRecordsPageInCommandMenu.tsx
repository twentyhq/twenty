import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLoadSelectedRecordsInContextStore } from '@/object-record/hooks/useLoadSelectedRecordsInContextStore';
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

  const { loadSelectedRecordsInContextStore } =
    useLoadSelectedRecordsInContextStore({
      objectNameSingular,
      objectRecordIds,
      objectMetadataItemId: objectMetadataItem.id,
    });

  const openMergeRecordsPageInCommandMenu = async () => {
    await loadSelectedRecordsInContextStore();

    navigateCommandMenu({
      page: CommandMenuPages.MergeRecords,
      pageTitle: t(msg`Merge records`),
      pageIcon: IconArrowMerge,
    });
  };

  return {
    openMergeRecordsPageInCommandMenu,
  };
};
