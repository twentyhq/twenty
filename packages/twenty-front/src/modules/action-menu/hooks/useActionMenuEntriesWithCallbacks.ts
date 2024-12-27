import { getActionConfig } from '@/action-menu/actions/record-actions/single-record/utils/getActionConfig';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { wrapActionInCallbacks } from '@/action-menu/actions/utils/wrapActionInCallbacks';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
import { isDefined } from 'twenty-ui';

export const useActionMenuEntriesWithCallbacks = (
  objectMetadataItem: ObjectMetadataItem,
  viewType: ActionViewType,
) => {
  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  const actionConfig = getActionConfig(
    objectMetadataItem,
    isPageHeaderV2Enabled,
  );

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

  const { onActionStartedCallback, onActionExecutedCallback } =
    useContext(ActionMenuContext);

  const actionMenuEntries = Object.values(actionConfig ?? {})
    .filter((action) => action.availableOn?.includes(viewType))
    .map((action) => {
      const { shouldBeRegistered, onClick, ConfirmationModal } =
        action.actionHook({
          recordId: selectedRecordId,
          objectMetadataItem,
        });

      if (!shouldBeRegistered) {
        return undefined;
      }

      const wrappedAction = wrapActionInCallbacks({
        action: {
          ...action,
          onClick,
          ConfirmationModal,
        },
        onActionStartedCallback,
        onActionExecutedCallback,
      });

      return wrappedAction;
    })
    .filter(isDefined);

  return { actionMenuEntries };
};
