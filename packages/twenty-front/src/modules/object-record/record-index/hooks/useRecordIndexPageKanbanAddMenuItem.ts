import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useRecoilValue } from 'recoil';

export const useRecordIndexPageKanbanAddMenuItem = (
  recordIndexId: string,
  columnId: string,
) => {
  const { columnsFamilySelector } = useRecordBoardStates(recordIndexId);
  const columnDefinition = useRecoilValue(columnsFamilySelector(columnId));

  return { columnDefinition };
};
