import { ChangeEvent, ReactElement, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { textInputStyle } from '@/ui/themes/effects';

import { EditableCell } from '../EditableCell';
import { useEditableCell } from '../hooks/useCloseEditableCell';

import { EditableDoubleTextEditMode } from './EditableDoubleTextEditMode';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  nonEditModeContent: ReactElement;
  onChange: (firstValue: string, secondValue: string) => void;
};

export function EditableDoubleText({
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
        <EditableDoubleTextEditMode
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
