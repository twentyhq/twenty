import { BooleanInput } from '@/ui/field/input/components/BooleanInput';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useContext } from 'react';
import { useBooleanField } from '@/object-record/record-field/ui/meta-types/hooks/useBooleanField';

export type BooleanFieldInputProps = {
  testId?: string;
};

export const BooleanFieldInput = ({ testId }: BooleanFieldInputProps) => {
  const { fieldValue } = useBooleanField();

  const { isRecordFieldReadOnly } = useContext(FieldContext);

  const { onSubmit } = useContext(FieldInputEventContext);

  const handleToggle = (newValue: boolean) => {
    onSubmit?.({ newValue });
  };

  return (
    <BooleanInput
      value={fieldValue ?? ''}
      onToggle={handleToggle}
      readonly={isRecordFieldReadOnly}
      testId={testId}
    />
  );
};
