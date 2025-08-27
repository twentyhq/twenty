import { RecordTitleCellContext } from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTitleCellContainer = () => {
  const { displayModeContent, editModeContent, isReadOnly } = useContext(
    RecordTitleCellContext,
  );

  const isTitleCellInEditMode = useRecoilComponentValue(
    isTitleCellInEditModeComponentState,
  );

  if (isDefined(isReadOnly) && isReadOnly) {
    return <>{displayModeContent}</>;
  }

  return <>{isTitleCellInEditMode ? editModeContent : displayModeContent}</>;
};
