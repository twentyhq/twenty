import { InplaceInputPhoneDisplayMode } from '@/ui/display/component/InplaceInputPhoneDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

import { EditableCell } from '../components/EditableCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  onSubmit?: (newText: string) => void;
};

export function EditableCellPhone({ value, placeholder, onSubmit }: OwnProps) {
  return (
    <EditableCell
      editModeContent={
        <InplaceInputTextEditMode
          autoComplete="off"
          autoFocus
          placeholder={placeholder || ''}
          value={value}
          onSubmit={(newText) => onSubmit?.(newText)}
        />
      }
      nonEditModeContent={<InplaceInputPhoneDisplayMode value={value} />}
    />
  );
}
