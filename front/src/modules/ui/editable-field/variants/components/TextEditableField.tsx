import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { OverflowingTextWithTooltip } from '../../../tooltip/OverflowingTextWithTooltip';

type OwnProps = {
  icon?: React.ReactNode;
  placeholder?: string;
  value: string | null | undefined;
  onSubmit?: (newValue: string) => void;
};

export function TextEditableField({
  icon,
  placeholder,
  value,
  onSubmit,
}: OwnProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    if (!internalValue) return;

    onSubmit?.(internalValue);
  }

  async function handleCancel() {
    setInternalValue(value);
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        iconLabel={icon}
        editModeContent={
          <TextInputEdit
            placeholder={placeholder ?? ''}
            autoFocus
            value={internalValue ?? ''}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={<OverflowingTextWithTooltip text={internalValue} />}
        isDisplayModeContentEmpty={!(internalValue !== '')}
      />
    </RecoilScope>
  );
}
