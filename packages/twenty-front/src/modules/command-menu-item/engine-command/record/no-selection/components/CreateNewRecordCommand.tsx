import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CreateGlobalRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateGlobalRecordCommand';
import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { getRecordCreationCommandType } from '@/command-menu-item/engine-command/record/no-selection/utils/getRecordCreationCommandType';
import { useCreateCoreWorkflow } from '@/object-core/workflows/hooks/useCreateCoreWorkflow';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const CreateNewRecordCommand = () => {
  const {
    objectMetadataItem: contextObjectMetadataItem,
    recordIndexId,
    hasAnySoftDeleteFilterOnView,
    creationTargetObjectMetadataId,
  } = useHeadlessCommandContextApi();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const objectMetadataItem = isDefined(creationTargetObjectMetadataId)
    ? objectMetadataItems.find(
        (item) => item.id === creationTargetObjectMetadataId,
      )
    : contextObjectMetadataItem;
  const { createCoreWorkflow } = useCreateCoreWorkflow();

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata item is required to create a record');
  }

  const commandType = getRecordCreationCommandType({
    objectNameSingular: objectMetadataItem.nameSingular,
    contextObjectMetadataId: contextObjectMetadataItem?.id,
    recordIndexId,
    hasAnySoftDeleteFilterOnView,
    creationTargetObjectMetadataId,
  });

  if (commandType === 'workflow') {
    return <HeadlessEngineCommandWrapperEffect execute={createCoreWorkflow} />;
  }

  return commandType === 'global' ? (
    <CreateGlobalRecordCommand objectMetadataItem={objectMetadataItem} />
  ) : (
    <CreateNewIndexRecordNoSelectionRecordCommand />
  );
};
