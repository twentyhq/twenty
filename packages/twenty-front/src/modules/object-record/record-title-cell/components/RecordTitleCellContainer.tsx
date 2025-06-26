import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { RecordTitleCellContext } from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTitleCellContainer = () => {
  const { displayModeContent, editModeContent, isReadOnly } = useContext(
    RecordTitleCellContext,
  );

  const { isInlineCellInEditMode } = useInlineCell();

  if (isDefined(isReadOnly) && isReadOnly) {
    return <>{displayModeContent}</>;
  }

  return <>{isInlineCellInEditMode ? editModeContent : displayModeContent}</>;
};
