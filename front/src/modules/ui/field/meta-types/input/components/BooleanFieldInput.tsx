import { BooleanInput } from '@/ui/input/components/BooleanInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useBooleanField } from '../../hooks/useBooleanField';

import { FieldInputEvent } from './DateFieldInput';

type OwnProps = {
  onSubmit?: FieldInputEvent;
};

export const BooleanFieldInput = ({ onSubmit }: OwnProps) => {
  const { fieldValue } = useBooleanField();

  const persistField = usePersistField();

  const handleToggle = (newValue: boolean) => {
    onSubmit?.(() => persistField(newValue));
  };

  return <BooleanInput value={fieldValue ?? ''} onToggle={handleToggle} />;
};
