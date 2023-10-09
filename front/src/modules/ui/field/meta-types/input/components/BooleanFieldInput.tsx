import { BooleanInput } from '@/ui/input/components/BooleanInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useBooleanField } from '../../hooks/useBooleanField';

import { FieldInputEvent } from './DateFieldInput';

type BooleanFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const BooleanFieldInput = ({ onSubmit }: BooleanFieldInputProps) => {
  const { fieldValue } = useBooleanField();

  const persistField = usePersistField();

  const handleToggle = (newValue: boolean) => {
    onSubmit?.(() => persistField(newValue));
  };

  return <BooleanInput value={fieldValue ?? ''} onToggle={handleToggle} />;
};
