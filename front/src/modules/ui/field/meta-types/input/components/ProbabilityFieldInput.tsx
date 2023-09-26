import { ProbabilityInput } from '@/ui/input/components/ProbabilityInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useProbabilityField } from '../../hooks/useProbabilityField';

import { FieldInputEvent } from './DateFieldInput';

type OwnProps = {
  onSubmit?: FieldInputEvent;
};

export const ProbabilityFieldInput = ({ onSubmit }: OwnProps) => {
  const { probabilityIndex } = useProbabilityField();

  const persistField = usePersistField();

  const handleChange = (newValue: number) => {
    onSubmit?.(() => persistField(newValue));
  };

  return (
    <ProbabilityInput
      probabilityIndex={probabilityIndex}
      onChange={handleChange}
    />
  );
};
