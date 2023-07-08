import { ReactElement } from 'react';

import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { EditableCell } from '../EditableCell';

import { EditableCellDoubleTextEditMode } from './EditableCellDoubleTextEditMode';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  nonEditModeContent: ReactElement;
  onChange: (firstValue: string, secondValue: string) => void;
};

export function EditableCellDoubleText({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onChange,
  nonEditModeContent,
}: OwnProps) {
  return (
    <EditableCell
      editHotkeysScope={{ scope: InternalHotkeysScope.CellDoubleTextInput }}
      editModeContent={
        <EditableCellDoubleTextEditMode
          firstValue={firstValue}
          secondValue={secondValue}
          firstValuePlaceholder={firstValuePlaceholder}
          secondValuePlaceholder={secondValuePlaceholder}
          onChange={onChange}
        />
      }
      nonEditModeContent={nonEditModeContent}
    ></EditableCell>
  );
}
