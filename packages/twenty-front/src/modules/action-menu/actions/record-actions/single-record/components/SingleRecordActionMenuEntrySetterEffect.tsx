import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';
import { isDefined } from 'twenty-ui';
import { useSingleRecordActions } from '../hooks/useSingleRecordActions';

export const SingleRecordActionMenuEntrySetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { registerSingleRecordActions, unregisterSingleRecordActions } =
    useSingleRecordActions({
      objectMetadataItem,
    });

  const actionConfig = WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG;
  // objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow
  //   ? WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG
  //   : null;

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

  const actionMenuEntries = Object.values(actionConfig)
    .map((action) => {
      const { shouldBeRegistered, onClick } =
        action.actionHook(selectedRecordId);

      console.log('shouldBeRegistered', shouldBeRegistered);
      console.log('onClick', onClick);
      console.log('action', action);

      if (shouldBeRegistered) {
        return {
          ...action,
          onClick,
        };
      }

      return undefined;
    })
    .filter(isDefined);

  useEffect(() => {
    if (!isDefined(actionConfig)) {
      return;
    }

    for (const action of actionMenuEntries) {
      addActionMenuEntry(action);
    }

    return () => {
      for (const action of Object.values(actionConfig)) {
        removeActionMenuEntry(action.key);
      }
    };
  }, [
    actionConfig,
    actionMenuEntries,
    addActionMenuEntry,
    removeActionMenuEntry,
  ]);

  // useEffect(() => {
  //   registerSingleRecordActions();

  //   return () => {
  //     unregisterSingleRecordActions();
  //   };
  // }, [
  //   objectMetadataItem.nameSingular,
  //   registerSingleRecordActions,
  //   unregisterSingleRecordActions,
  // ]);

  return null;
};
