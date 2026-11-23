import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CreateGlobalRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateGlobalRecordCommand';
import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { getRecordCreationCommandType } from '@/command-menu-item/engine-command/record/no-selection/utils/getRecordCreationCommandType';
import { useCreateCoreWorkflow } from '@/object-core/workflows/hooks/useCreateCoreWorkflow';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const CreateNewRecordCommand = () => {
  const {
    objectMetadataItem: contextObjectMetadataItem,
    coreObjectName,
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

  if (
    coreObjectName === 'workflow' &&
    !isDefined(creationTargetObjectMetadataId)
  ) {
    return <HeadlessEngineCommandWrapperEffect execute={createCoreWorkflow} />;
  }

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      doNotTranslate('Object metadata item is required to create a record'),
    );
  }

  const commandType = getRecordCreationCommandType({
    contextObjectMetadataId: contextObjectMetadataItem?.id,
    recordIndexId,
    hasAnySoftDeleteFilterOnView,
    creationTargetObjectMetadataId,
  });

  return commandType === 'global' ? (
    <CreateGlobalRecordCommand objectMetadataItem={objectMetadataItem} />
  ) : (
    <CreateNewIndexRecordNoSelectionRecordCommand />
  );
};
