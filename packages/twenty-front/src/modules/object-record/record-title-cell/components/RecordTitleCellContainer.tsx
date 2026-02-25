import { RecordTitleCellContext } from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTitleCellContainer = () => {
  const { displayModeContent, editModeContent, isReadOnly } = useContext(
    RecordTitleCellContext,
  );

  const isTitleCellInEditMode = useAtomComponentStateValue(
    isTitleCellInEditModeComponentState,
  );

  if (isDefined(isReadOnly) && isReadOnly) {
    return <>{displayModeContent}</>;
  }

  return <>{isTitleCellInEditMode ? editModeContent : displayModeContent}</>;
};
