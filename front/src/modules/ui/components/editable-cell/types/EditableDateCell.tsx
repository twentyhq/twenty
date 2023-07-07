import { InplaceDateInput } from '../../inplace-input/types/InplaceDateInput';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

type OwnProps = {
  placeholder?: string;
  value: Date;
  changeHandler: (date: Date) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

export function EditableDateCell(props: OwnProps) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();
  const hasSoftFocus = useIsSoftFocusOnCurrentCell();
  return (
    <InplaceDateInput
      {...props}
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentCell}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
