import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldRecoilScopeContext } from '@/ui/editable-field/states/recoil-scope-contexts/FieldRecoilScopeContext';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { PhoneInputDisplay } from '@/ui/input/phone/components/PhoneInputDisplay';
import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

type OwnProps = {
  Icon?: IconComponent;
  placeholder?: string;
  value: string | null | undefined;
  onSubmit?: (newValue: string) => void;
};

export function PhoneEditableField({
  Icon,
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
    <RecoilScope SpecificContext={FieldRecoilScopeContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        IconLabel={Icon}
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
        displayModeContent={<PhoneInputDisplay value={internalValue ?? ''} />}
        isDisplayModeContentEmpty={!(internalValue !== '')}
        useEditButton
      />
    </RecoilScope>
  );
}
