import { ProbabilityInput } from '@/ui/field/meta-types/input/components/internal/ProbabilityInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useProbabilityField } from '../../hooks/useProbabilityField';

import { FieldInputEvent } from './DateFieldInput';

type ProbabilityFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const ProbabilityFieldInput = ({
  onSubmit,
}: ProbabilityFieldInputProps) => {
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
