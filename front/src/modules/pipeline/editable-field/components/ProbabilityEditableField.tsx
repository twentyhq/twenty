import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';

import { ProbabilityFieldEditMode } from './ProbabilityFieldEditMode';

type OwnProps = {
  icon?: React.ReactNode;
  value: number | null | undefined;
  onSubmit?: (newValue: number) => void;
};

export function ProbabilityEditableField({ icon, value, onSubmit }: OwnProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  async function handleChange(newValue: number) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    if (!internalValue) return;

    try {
      const numberValue = internalValue;

      if (isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      if (numberValue < 0 || numberValue > 100) {
        throw new Error('Not a probability');
      }

      onSubmit?.(numberValue);

      setInternalValue(numberValue);
    } catch {
      handleCancel();
    }
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
        displayModeContentOnly
        disableHoverEffect
        displayModeContent={
          <ProbabilityFieldEditMode
            value={internalValue ?? 0}
            onChange={(newValue: number) => {
              handleChange(newValue);
            }}
          />
        }
      />
    </RecoilScope>
  );
}
