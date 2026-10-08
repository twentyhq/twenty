import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const CreateNewIndexRecordNoSelectionRecordCommand = () => {
  const { objectMetadataItem, recordIndexId } = useHeadlessCommandContextApi();

  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
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

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={
        isRecordCreationFormEnabled
          ? () => void createNewIndexRecord({ position: 'first' })
          : () => createNewIndexRecord({ position: 'first' })
      }
    />
  );
};
