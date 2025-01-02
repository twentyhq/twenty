import { MultipleRecordsActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/multiple-records/components/MultipleRecordsActionMenuEntrySetterEffect';
import { NoSelectionActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/no-selection/components/NoSelectionActionMenuEntrySetterEffect';
import { SingleRecordActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/single-record/components/SingleRecordActionMenuEntrySetterEffect';
import { WorkflowRunRecordActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/workflow-run-record-actions/components/WorkflowRunRecordActionMenuEntrySetter';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

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

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

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
            {contextStoreCurrentViewType === ContextStoreViewType.ShowPage && (
              <SingleRecordActionMenuEntrySetterEffect
                objectMetadataItem={objectMetadataItem}
                viewType={ActionViewType.SHOW_PAGE}
              />
            )}
            {(contextStoreCurrentViewType === ContextStoreViewType.Table ||
              contextStoreCurrentViewType === ContextStoreViewType.Kanban) && (
              <SingleRecordActionMenuEntrySetterEffect
                objectMetadataItem={objectMetadataItem}
                viewType={ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION}
              />
            )}
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
