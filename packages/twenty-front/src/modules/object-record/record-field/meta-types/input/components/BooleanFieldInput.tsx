import { BooleanInput } from '@/ui/field/input/components/BooleanInput';

import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { usePersistField } from '../../../hooks/usePersistField';
import { useBooleanField } from '../../hooks/useBooleanField';

export type BooleanFieldInputProps = {
  onSubmit?: FieldInputEvent;
  readonly?: boolean;
  testId?: string;
};

export const BooleanFieldInput = ({
  onSubmit,
  readonly,
  testId,
}: BooleanFieldInputProps) => {
  const { fieldValue } = useBooleanField();

  const persistField = usePersistField();

  const handleToggle = (newValue: boolean) => {
    onSubmit?.(() => persistField(newValue));
  };

  return (
    <BooleanInput
      value={fieldValue ?? ''}
      onToggle={handleToggle}
      readonly={readonly}
      testId={testId}
    />
  );
};
