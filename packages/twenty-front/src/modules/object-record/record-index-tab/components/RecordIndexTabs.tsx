import { RecordIndexTabsContent } from '@/object-record/record-index-tab/components/RecordIndexTabsContent';
import { isRecordIndexTabsDisplayedComponentSelector } from '@/object-record/record-index-tab/states/selectors/isRecordIndexTabsDisplayedComponentSelector';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexTabs = () => {
  const isRecordIndexTabsDisplayed = useAtomComponentSelectorValue(
    isRecordIndexTabsDisplayedComponentSelector,
  );

  const recordIndexTabFieldMetadataItem = useAtomComponentStateValue(
    recordIndexTabFieldMetadataItemComponentState,
  );

  if (
    !isRecordIndexTabsDisplayed ||
    !isDefined(recordIndexTabFieldMetadataItem)
  ) {
    return null;
  }

  return (
    <RecordIndexTabsContent
      recordIndexTabFieldMetadataItem={recordIndexTabFieldMetadataItem}
    />
  );
};
