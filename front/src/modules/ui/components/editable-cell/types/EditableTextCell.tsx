import { InplaceTextInput } from '../../inplace-input/types/InplaceTextInput';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

type OwnProps = {
  placeholder?: string;
  content: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function EditableTextCell({
  editModeHorizontalAlign = 'left',
  content,
  changeHandler,
  placeholder,
}: OwnProps) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();
  const hasSoftFocus = useIsSoftFocusOnCurrentCell();
  return (
    <InplaceTextInput
      editModeHorizontalAlign={editModeHorizontalAlign}
      content={content}
      changeHandler={changeHandler}
      placeholder={placeholder}
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentCell}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
