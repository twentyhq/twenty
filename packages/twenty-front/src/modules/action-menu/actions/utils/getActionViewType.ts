import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';

export const getActionViewType = (
  contextStoreCurrentViewType: ContextStoreViewType | null,
  contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule,
) => {
  if (contextStoreCurrentViewType === null) {
    return null;
  }

  if (contextStoreCurrentViewType === ContextStoreViewType.ShowPage) {
    return ActionViewType.SHOW_PAGE;
  }

  if (
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 0
  ) {
    return ActionViewType.INDEX_PAGE_NO_SELECTION;
  }

  if (
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1
  ) {
    return ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION;
  }

  return ActionViewType.INDEX_PAGE_BULK_SELECTION;
};
