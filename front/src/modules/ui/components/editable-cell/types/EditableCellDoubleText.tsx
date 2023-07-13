import { ReactElement, useEffect, useState } from 'react';

import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { CellSkeleton } from '../CellSkeleton';
import { EditableCell } from '../EditableCell';

import { EditableCellDoubleTextEditMode } from './EditableCellDoubleTextEditMode';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  nonEditModeContent: ReactElement;
  onChange: (firstValue: string, secondValue: string) => void;
  loading?: boolean;
};

export function EditableCellDoubleText({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onChange,
  nonEditModeContent,
  loading,
}: OwnProps) {
  const [firstInternalValue, setFirstInternalValue] = useState(firstValue);
  const [secondInternalValue, setSecondInternalValue] = useState(secondValue);

  useEffect(() => {
    setFirstInternalValue(firstValue);
    setSecondInternalValue(secondValue);
  }, [firstValue, secondValue]);

  function handleOnChange(firstValue: string, secondValue: string): void {
    setFirstInternalValue(firstValue);
    setSecondInternalValue(secondValue);
    onChange(firstValue, secondValue);
  }

  return (
    <EditableCell
      editHotkeysScope={{ scope: InternalHotkeysScope.CellDoubleTextInput }}
      editModeContent={
        <EditableCellDoubleTextEditMode
          firstValue={firstInternalValue}
          secondValue={secondInternalValue}
          firstValuePlaceholder={firstValuePlaceholder}
          secondValuePlaceholder={secondValuePlaceholder}
          onChange={handleOnChange}
        />
      }
      nonEditModeContent={loading ? <CellSkeleton /> : nonEditModeContent}
    ></EditableCell>
  );
}
