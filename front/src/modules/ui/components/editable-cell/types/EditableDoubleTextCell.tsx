import { ReactElement } from 'react';

import { InplaceDoubleTextInput } from '../../inplace-input/types/InplaceDoubleTextInput';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  nonEditModeContent: ReactElement;
  onChange: (firstValue: string, secondValue: string) => void;
};

export function EditableDoubleTextCell({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  nonEditModeContent,
  onChange,
}: OwnProps) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();
  const hasSoftFocus = useIsSoftFocusOnCurrentCell();
  return (
    <InplaceDoubleTextInput
      firstValue={firstValue}
      secondValue={secondValue}
      firstValuePlaceholder={firstValuePlaceholder}
      secondValuePlaceholder={secondValuePlaceholder}
      nonEditModeContent={nonEditModeContent}
      onChange={onChange}
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentCell}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
