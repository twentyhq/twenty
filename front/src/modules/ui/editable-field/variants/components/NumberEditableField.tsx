import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { InplaceInputText } from '@/ui/inplace-input/components/InplaceInputText';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

type OwnProps = {
  icon?: React.ReactNode;
  placeholder?: string;
  value: number | null | undefined;
  onSubmit?: (newValue: number | null) => void;
};

export function NumberEditableField({
  icon,
  placeholder,
  value,
  onSubmit,
}: OwnProps) {
  const [internalValue, setInternalValue] = useState(value?.toString());

  useEffect(() => {
    setInternalValue(value?.toString());
  }, [value]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    if (!canBeCastAsIntegerOrNull(internalValue)) {
      handleCancel();
      return;
    }

    const valueCastedAsNumberOrNull = castAsIntegerOrNull(internalValue);

    onSubmit?.(valueCastedAsNumberOrNull);

    setInternalValue(valueCastedAsNumberOrNull?.toString());
  }

  async function handleCancel() {
    setInternalValue(value?.toString());
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        iconLabel={icon}
        editModeContent={
          <InplaceInputText
            placeholder={placeholder ?? ''}
            autoFocus
            value={internalValue ?? ''}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={internalValue}
        isDisplayModeContentEmpty={!(internalValue !== '' && internalValue)}
      />
    </RecoilScope>
  );
}
