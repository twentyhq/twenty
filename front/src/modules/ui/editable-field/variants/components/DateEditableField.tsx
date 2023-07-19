import { useEffect, useState } from 'react';

import { InplaceInputDateDisplayMode } from '@/ui/display/component/InplaceInputDateDisplayMode';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { parseDate } from '~/utils/date-utils';

import { EditableFieldEditModeDate } from './EditableFieldEditModeDate';

type OwnProps = {
  icon?: React.ReactNode;
  value: string | null | undefined;
  onSubmit?: (newValue: string) => void;
};

export function DateEditableField({ icon, value, onSubmit }: OwnProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);

    onSubmit?.(newValue);
  }

  async function handleSubmit() {
    if (!internalValue) return;

    onSubmit?.(internalValue);
  }

  async function handleCancel() {
    setInternalValue(value);
  }

  const internalDateValue = internalValue
    ? parseDate(internalValue).toJSDate()
    : null;

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        iconLabel={icon}
        editModeContent={
          <EditableFieldEditModeDate
            value={internalValue ?? ''}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={
          <InplaceInputDateDisplayMode value={internalDateValue} />
        }
        isDisplayModeContentEmpty={!(internalValue !== '')}
      />
    </RecoilScope>
  );
}
