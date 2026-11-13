import { recordIndexViewTabsComponentState } from '@/object-record/record-index-tab/states/recordIndexViewTabsComponentState';
import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { computeRecordIndexTabs } from '@/object-record/record-index-tab/utils/computeRecordIndexTabs';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexTabsComponentSelector = createAtomComponentSelector<
  RecordIndexTab[]
>({
  key: 'recordIndexTabsComponentSelector',
  componentInstanceContext: ViewComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) =>
      computeRecordIndexTabs({
        recordIndexTabFieldMetadataItem: get(
          recordIndexTabFieldMetadataItemComponentState,
          { instanceId },
        ),
        viewTabs: get(recordIndexViewTabsComponentState, { instanceId }),
      }),
});
