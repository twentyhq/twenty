import { RecordTitleCellContext } from '@/object-record/record-title-cell/components/RecordTitleCellContext';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTitleCellContainer = () => {
  const { displayModeContent, editModeContent, isReadOnly } = useContext(
    RecordTitleCellContext,
  );

  const isTitleCellInEditMode = useRecoilComponentValueV2(
    isTitleCellInEditModeComponentState,
  );

  if (isDefined(isReadOnly) && isReadOnly) {
    return <>{displayModeContent}</>;
  }

  return <>{isTitleCellInEditMode ? editModeContent : displayModeContent}</>;
};
