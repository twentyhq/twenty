import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { ViewType } from '@/views/types/ViewType';

export const RecordBoardColumns = () => {
  const visibleRecordGroupIds = useRecoilComponentFamilyValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  return visibleRecordGroupIds.map((recordGroupId, index) => {
    return (
      <RecordBoardColumn
        key={recordGroupId}
        recordBoardColumnId={recordGroupId}
        recordBoardColumnIndex={index}
      />
    );
  });
};
