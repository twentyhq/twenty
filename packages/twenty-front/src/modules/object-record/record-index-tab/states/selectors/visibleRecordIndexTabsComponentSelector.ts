import { recordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/recordIndexTabsComponentSelector';
import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const visibleRecordIndexTabsComponentSelector =
  createAtomComponentSelector<RecordIndexTab[]>({
    key: 'visibleRecordIndexTabsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        get(recordIndexTabsComponentSelector, { instanceId }).filter(
          ({ isVisible }) => isVisible,
        ),
  });
