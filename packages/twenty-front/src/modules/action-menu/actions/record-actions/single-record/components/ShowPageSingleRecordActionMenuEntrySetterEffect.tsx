import { getActionConfig } from '@/action-menu/actions/record-actions/single-record/utils/getActionConfig';
import { ActionAvailableOn } from '@/action-menu/actions/types/actionAvailableOn';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffect } from 'react';
import { isDefined } from 'twenty-ui';

export const ShowPageSingleRecordActionMenuEntrySetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  const actionConfig = getActionConfig(
    objectMetadataItem,
    isPageHeaderV2Enabled,
  );

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
    .filter((action) =>
      action.availableOn?.includes(ActionAvailableOn.SHOW_PAGE),
    )
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
