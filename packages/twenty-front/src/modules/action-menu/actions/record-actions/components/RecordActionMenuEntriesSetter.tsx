import { RegisterRecordActionEffect } from '@/action-menu/actions/record-actions/components/RegisterRecordActionEffect';
import { WorkflowRunRecordActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/workflow-run-record-actions/components/WorkflowRunRecordActionMenuEntrySetter';
import { getActionConfig } from '@/action-menu/actions/utils/getActionConfig';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
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

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  if (
    !isDefined(contextStoreCurrentObjectMetadataId) ||
    !isDefined(objectMetadataItem)
  ) {
    return null;
  }

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const actionConfig = getActionConfig(
    objectMetadataItem,
    isCommandMenuV2Enabled,
  );

  const actionsToRegister = isDefined(viewType)
    ? Object.values(actionConfig ?? {}).filter((action) =>
        action.availableOn?.includes(viewType),
      )
    : [];

  return (
    <>
      {actionsToRegister.map((action) => (
        <RegisterRecordActionEffect
          key={action.key}
          action={action}
          objectMetadataItem={objectMetadataItem}
        />
      ))}

      {isWorkflowEnabled &&
        contextStoreTargetedRecordsRule?.mode === 'selection' &&
        contextStoreTargetedRecordsRule?.selectedRecordIds.length === 1 && (
          <WorkflowRunRecordActionMenuEntrySetterEffect
            objectMetadataItem={objectMetadataItem}
          />
        )}
    </>
  );
};
