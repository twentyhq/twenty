import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/action-menu/actions/record-agnostic-actions/constants/RecordAgnosticActionsConfig';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { getActionConfig } from '@/action-menu/actions/utils/getActionConfig';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRegisteredActions = () => {
  const localContextStoreCurrentObjectMetadataItemId =
    useRecoilComponentValueV2(
      contextStoreCurrentObjectMetadataItemIdComponentState,
    );

  const mainContextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const localContextStoreObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === localContextStoreCurrentObjectMetadataItemId,
  );

  const mainContextStoreObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === mainContextStoreCurrentObjectMetadataItemId,
  );

  const objectMetadataItem =
    localContextStoreObjectMetadataItem ?? mainContextStoreObjectMetadataItem;

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const params = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
  );

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const recordActionConfig = getActionConfig(objectMetadataItem);

  const recordAgnosticActionConfig = RECORD_AGNOSTIC_ACTIONS_CONFIG;

  const actionsConfig = {
    ...recordActionConfig,
    ...recordAgnosticActionConfig,
  };

  const actionsToRegister = isDefined(viewType)
    ? Object.values(actionsConfig ?? {}).filter(
        (action) =>
          action.availableOn?.includes(viewType) ||
          action.availableOn?.includes(ActionViewType.GLOBAL),
      )
    : [];

  const actions = actionsToRegister.filter((action) =>
    action.shouldBeRegistered(params),
  );

  return actions;
};
