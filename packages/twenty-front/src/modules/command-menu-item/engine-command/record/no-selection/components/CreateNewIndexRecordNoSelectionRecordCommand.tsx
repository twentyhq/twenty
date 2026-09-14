import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateCoreWorkflow } from '@/object-core/workflows/hooks/useCreateCoreWorkflow';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const CreateNewIndexRecordNoSelectionRecordCommand = () => {
  const {
    objectMetadataItem: contextObjectMetadataItem,
    recordIndexId: contextRecordIndexId,
    navigationTargetObjectMetadataId,
  } = useHeadlessCommandContextApi();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const objectMetadataItem = isDefined(navigationTargetObjectMetadataId)
    ? objectMetadataItems.find(
        (item) => item.id === navigationTargetObjectMetadataId,
      )
    : contextObjectMetadataItem;
  // Global creation must not inherit another object's view filters or groups.
  const recordIndexId = isDefined(navigationTargetObjectMetadataId)
    ? `global-record-creation-${navigationTargetObjectMetadataId}`
    : contextRecordIndexId;

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  if (!isDefined(objectMetadataItem) || !isDefined(recordIndexId)) {
    throw new Error(
      'Object metadata item and record index ID are required to create new index record',
    );
  }

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
    instanceId: recordIndexId,
  });

  const { createCoreWorkflow } = useCreateCoreWorkflow();

  const shouldCreateThroughCoreWorkflow =
    isWorkflowCoreIndexPageEnabled &&
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow;

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() =>
        shouldCreateThroughCoreWorkflow
          ? createCoreWorkflow()
          : createNewIndexRecord({ position: 'first' })
      }
    />
  );
};
