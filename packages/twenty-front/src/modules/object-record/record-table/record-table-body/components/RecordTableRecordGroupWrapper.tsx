import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { RecordTableRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableRecordGroupBodyContextProvider';
import { RecordTableRecordGroupRows } from '@/object-record/record-table/components/RecordTableRecordGroupRows';
import { RecordTableBodyRecordGroupDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyRecordGroupDroppable';
import { RecordTableCellPortals } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortals';
import { RecordTableRecordGroupSection } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupSection';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type RecordTableRecordGroupWrapperProps = {
  recordGroupId: string;
  index: number;
};

export const RecordTableRecordGroupWrapper = ({
  recordGroupId,
  index,
}: RecordTableRecordGroupWrapperProps) => {
  const shouldHideEmptyRecordGroups = useRecoilComponentValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const recordIdsByGroup = useRecoilComponentFamilyValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordGroupId,
  );

  const isRecordGroupEmpty = recordIdsByGroup.length === 0;

  if (shouldHideEmptyRecordGroups && isRecordGroupEmpty) {
    return null;
  }

  return (
    <RecordTableRecordGroupBodyContextProvider
      key={recordGroupId}
      recordGroupId={recordGroupId}
    >
      <RecordGroupContext.Provider value={{ recordGroupId }}>
        <RecordTableBodyRecordGroupDroppable recordGroupId={recordGroupId}>
          <RecordTableRecordGroupSection />
          <RecordTableRecordGroupRows />
          {index === 0 && <RecordTableCellPortals />}
        </RecordTableBodyRecordGroupDroppable>
      </RecordGroupContext.Provider>
    </RecordTableRecordGroupBodyContextProvider>
  );
};
