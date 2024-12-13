import { DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V1 } from '@/action-menu/actions/record-actions/single-record/constants/DefaultSingleRecordActionsConfigV1';
import { DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V2 } from '@/action-menu/actions/record-actions/single-record/constants/DefaultSingleRecordActionsConfigV2';
import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { WORKFLOW_VERSIONS_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/constants/WorkflowVersionsSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffect } from 'react';
import { isDefined } from 'twenty-ui';

export const SingleRecordActionMenuEntrySetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  const actionConfig =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow
      ? WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG
      : objectMetadataItem.nameSingular ===
          CoreObjectNameSingular.WorkflowVersion
        ? WORKFLOW_VERSIONS_SINGLE_RECORD_ACTIONS_CONFIG
        : isPageHeaderV2Enabled
          ? DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V2
          : DEFAULT_SINGLE_RECORD_ACTIONS_CONFIG_V1;

  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  if (!isDefined(selectedRecordId)) {
    throw new Error('Selected record ID is required');
  }

  const actionMenuEntries = Object.values(actionConfig ?? {})
    .map((action) => {
      const { shouldBeRegistered, onClick, ConfirmationModal } =
        action.actionHook({
          recordId: selectedRecordId,
          objectMetadataItem,
        });

      if (shouldBeRegistered) {
        return {
          ...action,
          onClick,
          ConfirmationModal,
        };
      }

      return undefined;
    })
    .filter(isDefined);

  useEffect(() => {
    for (const action of actionMenuEntries) {
      addActionMenuEntry(action);
    }

    return () => {
      for (const action of actionMenuEntries) {
        removeActionMenuEntry(action.key);
      }
    };
  }, [actionMenuEntries, addActionMenuEntry, removeActionMenuEntry]);

  return null;
};
