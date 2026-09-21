import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { RecordListRecordGroup } from '@/object-record/record-list/components/RecordListRecordGroup';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { ViewType } from '@/views/types/ViewType';

export const RecordListRecordGroupsBody = () => {
  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.LIST,
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
