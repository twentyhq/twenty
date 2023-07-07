import { ReactElement } from 'react';

import { InplaceInput } from '../inplace-input/InplaceInput';

import { useIsSoftFocusOnCurrentCell } from './hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from './hooks/useSetSoftFocusOnCurrentCell';

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
};

export function EditableCell({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
}: OwnProps) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();
  const hasSoftFocus = useIsSoftFocusOnCurrentCell();
  return (
    <InplaceInput
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeVerticalPosition={editModeVerticalPosition}
      editModeContent={editModeContent}
      nonEditModeContent={nonEditModeContent}
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentCell}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
