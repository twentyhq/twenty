import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useCreateNavigationMenuItem';
import { isDefined } from 'twenty-shared/utils';

export const AddToFavoritesSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata item is required to add to favorites');
  }

  const { createNavigationMenuItem } = useCreateNavigationMenuItem();

  const handleExecute = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    createNavigationMenuItem(selectedRecord, objectMetadataItem.nameSingular);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
