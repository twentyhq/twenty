import { InplacePhoneInput } from '../../inplace-input/types/InplacePhoneInput';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  changeHandler: (Phone: string) => void;
};

export function EditablePhoneCell({
  value,
  changeHandler,
  placeholder,
}: OwnProps) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();
  const hasSoftFocus = useIsSoftFocusOnCurrentCell();
  return (
    <InplacePhoneInput
      value={value}
      changeHandler={changeHandler}
      placeholder={placeholder}
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentCell}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
