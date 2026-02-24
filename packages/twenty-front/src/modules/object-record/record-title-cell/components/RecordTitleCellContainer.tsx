import { RecordTitleCellContext } from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTitleCellContainer = () => {
  const { displayModeContent, editModeContent, isReadOnly } = useContext(
    RecordTitleCellContext,
  );

  const isTitleCellInEditMode = useAtomComponentValue(
    isTitleCellInEditModeComponentState,
  );

  if (isDefined(isReadOnly) && isReadOnly) {
    return <>{displayModeContent}</>;
  }

  return <>{isTitleCellInEditMode ? editModeContent : displayModeContent}</>;
};
