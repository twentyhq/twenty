import { MultipleRecordsActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/multiple-records/components/MultipleRecordsActionMenuEntrySetterEffect';
import { NoSelectionActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/no-selection/components/NoSelectionActionMenuEntrySetterEffect';
import { SingleRecordActionMenuEntrySetter } from '@/action-menu/actions/record-actions/single-record/components/SingleRecordActionMenuEntrySetter';
import { WorkflowRunRecordActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/workflow-run-record-actions/components/WorkflowRunRecordActionMenuEntrySetter';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataId,
  );

  if (
    !isDefined(contextStoreCurrentObjectMetadataId) ||
    !isDefined(objectMetadataItem)
  ) {
    return null;
  }

  return (
    <ActionEffects objectMetadataItemId={contextStoreCurrentObjectMetadataId} />
  );
};

const ActionEffects = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  return (
    <>
      {contextStoreTargetedRecordsRule.mode === 'selection' &&
        contextStoreTargetedRecordsRule.selectedRecordIds.length === 0 && (
          <NoSelectionActionMenuEntrySetterEffect
            objectMetadataItem={objectMetadataItem}
          />
        )}
      {contextStoreTargetedRecordsRule.mode === 'selection' &&
        contextStoreTargetedRecordsRule.selectedRecordIds.length === 1 && (
          <>
            <SingleRecordActionMenuEntrySetter
              objectMetadataItem={objectMetadataItem}
            />
            {isWorkflowEnabled && (
              <WorkflowRunRecordActionMenuEntrySetterEffect
                objectMetadataItem={objectMetadataItem}
              />
            )}
          </>
        )}
      {(contextStoreTargetedRecordsRule.mode === 'exclusion' ||
        contextStoreTargetedRecordsRule.selectedRecordIds.length > 1) && (
        <MultipleRecordsActionMenuEntrySetterEffect
          objectMetadataItem={objectMetadataItem}
        />
      )}
    </>
  );
};
