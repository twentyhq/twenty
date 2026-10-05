import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { visibleRecordGroupIdsIncludingEmptyComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsIncludingEmptyComponentSelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { RecordListRecordGroup } from '@/object-record/record-list/components/RecordListRecordGroup';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

// Each group loads its own records, so empty groups stay mounted and hide
// themselves, and show again once records come back
export const RecordListRecordGroupsBody = () => {
  const visibleRecordGroupIds = useAtomComponentSelectorValue(
    visibleRecordGroupIdsIncludingEmptyComponentSelector,
  );

  return (
    <>
      {visibleRecordGroupIds.map((recordGroupId) => (
        <RecordGroupContext.Provider
          key={recordGroupId}
          value={{ recordGroupId }}
        >
          <RecordListRecordGroup />
        </RecordGroupContext.Provider>
      ))}
      <RecordIndexGroupAggregatesDataLoader />
    </>
  );
};
