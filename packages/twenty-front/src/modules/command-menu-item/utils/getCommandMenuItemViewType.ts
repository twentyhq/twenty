import { CommandMenuItemViewType } from 'twenty-shared/types';
import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';

export const getCommandMenuItemViewType = (
  contextStoreCurrentViewType: ContextStoreViewType | null,
  contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule,
) => {
  if (contextStoreCurrentViewType === null) {
    return null;
  }

  if (contextStoreCurrentViewType === ContextStoreViewType.ShowPage) {
    return CommandMenuItemViewType.SHOW_PAGE;
  }

  if (
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 0
  ) {
    return CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION;
  }

  if (
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1
  ) {
    return CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION;
  }

  return CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION;
};
