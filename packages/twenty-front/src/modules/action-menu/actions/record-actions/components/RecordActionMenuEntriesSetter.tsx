import { RegisterRecordActionEffect } from '@/action-menu/actions/record-actions/components/RegisterRecordActionEffect';
import { useFirstSelectedRecordIdInContextStore } from '@/action-menu/actions/record-actions/single-record/hooks/useFirstSelectedRecordIdInContextStore';
import { WorkflowRunRecordActionMenuEntrySetterEffect } from '@/action-menu/actions/record-actions/workflow-run-record-actions/components/WorkflowRunRecordActionMenuEntrySetter';
import { getActionConfig } from '@/action-menu/actions/utils/getActionConfig';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { isActionOnSelectedRecord } from '@/action-menu/actions/utils/isActionOnSelectedRecord';
import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated/graphql';

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreCurrentObjectMetadataItem = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemComponentState,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
  );

  const firstSelectedRecordIdInContextStore =
    useFirstSelectedRecordIdInContextStore();

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  if (!isDefined(contextStoreCurrentObjectMetadataItem)) {
    return null;
  }

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const actionConfig = getActionConfig(
    contextStoreCurrentObjectMetadataItem,
    isCommandMenuV2Enabled,
  );

  const actionsToRegister = isDefined(viewType)
    ? Object.values(actionConfig ?? {}).filter((action) =>
        action.availableOn?.includes(viewType),
      )
    : [];

  const actionsOnSelectedRecord = actionsToRegister.filter(
    isActionOnSelectedRecord,
  );

  const actionsWithoutSelectedRecord = actionsToRegister.filter(
    (action) => !isActionOnSelectedRecord(action),
  );

  const shouldRegisterActionsOnSelectedRecord = isNonEmptyString(
    firstSelectedRecordIdInContextStore,
  );

  return (
    <>
      {shouldRegisterActionsOnSelectedRecord &&
        actionsOnSelectedRecord.map((action) => (
          <RegisterRecordActionEffect
            key={action.key}
            action={action}
            objectMetadataItem={contextStoreCurrentObjectMetadataItem}
          />
        ))}
      {actionsWithoutSelectedRecord.map((action) => (
        <RegisterRecordActionEffect
          key={action.key}
          action={action}
          objectMetadataItem={contextStoreCurrentObjectMetadataItem}
        />
      ))}
      {isWorkflowEnabled &&
        contextStoreTargetedRecordsRule?.mode === 'selection' &&
        contextStoreTargetedRecordsRule?.selectedRecordIds.length === 1 && (
          <WorkflowRunRecordActionMenuEntrySetterEffect
            objectMetadataItem={contextStoreCurrentObjectMetadataItem}
          />
        )}
    </>
  );
};
