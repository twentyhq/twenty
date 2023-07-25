import { ReactElement } from 'react';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { CellSkeleton } from '../components/CellSkeleton';
import { EditableCell } from '../components/EditableCell';

import { EditableCellDoubleTextEditMode } from './EditableCellDoubleTextEditMode';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  nonEditModeContent: ReactElement;
  onSubmit?: (firstValue: string, secondValue: string) => void;
  onCancel?: () => void;
  loading?: boolean;
};

export function EditableCellDoubleText({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,

  onSubmit,
  onCancel,
  nonEditModeContent,
  loading,
}: OwnProps) {
  return (
    <EditableCell
      editHotkeyScope={{ scope: TableHotkeyScope.CellDoubleTextInput }}
      editModeContent={
        <EditableCellDoubleTextEditMode
          firstValue={firstValue}
          secondValue={secondValue}
          firstValuePlaceholder={firstValuePlaceholder}
          secondValuePlaceholder={secondValuePlaceholder}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      }
      nonEditModeContent={loading ? <CellSkeleton /> : nonEditModeContent}
    ></EditableCell>
  );
}
