import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { RecordTitleCellContext } from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { useContext } from 'react';

export const RecordTitleCellContainer = () => {
  const { displayModeContent, editModeContent } = useContext(
    RecordTitleCellContext,
  );

  const { isInlineCellInEditMode } = useInlineCell();

  return <>{isInlineCellInEditMode ? editModeContent : displayModeContent}</>;
};
