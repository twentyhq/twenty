import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { isDefined } from 'twenty-shared/utils';

export type PageLayoutSidePanelTarget = {
  objectMetadataItemId: string;
  recordId: string;
};

export const getPageLayoutSidePanelTarget = ({
  contextStoreCurrentObjectMetadataItemId,
  contextStoreTargetedRecordsRule,
}: {
  contextStoreCurrentObjectMetadataItemId: string | undefined;
  contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule;
}): PageLayoutSidePanelTarget | null => {
  if (
    !isDefined(contextStoreCurrentObjectMetadataItemId) ||
    contextStoreTargetedRecordsRule.mode !== 'selection' ||
    contextStoreTargetedRecordsRule.selectedRecordIds.length !== 1
  ) {
    return null;
  }

  return {
    objectMetadataItemId: contextStoreCurrentObjectMetadataItemId,
    recordId: contextStoreTargetedRecordsRule.selectedRecordIds[0],
  };
};
