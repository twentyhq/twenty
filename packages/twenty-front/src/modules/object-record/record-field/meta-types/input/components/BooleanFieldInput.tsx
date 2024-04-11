import { BooleanInput } from '@/ui/field/input/components/BooleanInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useBooleanField } from '../../hooks/useBooleanField';

import { FieldInputEvent } from './DateTimeFieldInput';

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
