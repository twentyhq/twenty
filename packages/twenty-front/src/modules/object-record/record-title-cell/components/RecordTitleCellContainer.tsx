import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';

export const RecordTitleCellContainer = () => {
  const { displayModeContent, editModeContent } = useRecordInlineCellContext();

  const { isInlineCellInEditMode } = useInlineCell();

  return <>{isInlineCellInEditMode ? editModeContent : displayModeContent}</>;
};
