import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useCreateNavigationMenuItem } from '@/navigation-menu-item/hooks/useCreateNavigationMenuItem';
import { isDefined } from 'twenty-shared/utils';

export const AddToFavoritesSingleRecordCommand = () => {
  const { objectMetadataItem, selectedRecord } =
    useEngineCommandExecutionContext();

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
