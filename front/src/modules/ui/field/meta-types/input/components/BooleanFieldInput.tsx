import { BooleanInput } from '@/ui/field/meta-types/input/components/internal/BooleanInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useBooleanField } from '../../hooks/useBooleanField';

import { FieldInputEvent } from './DateFieldInput';

export type BooleanFieldInputProps = {
  onSubmit?: FieldInputEvent;
  testId?: string;
};

export const BooleanFieldInput = ({
  onSubmit,
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
      testId={testId}
    />
  );
};
