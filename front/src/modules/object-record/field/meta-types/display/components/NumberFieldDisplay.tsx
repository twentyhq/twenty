import { NumberDisplay } from '@/ui/field/components/NumberDisplay';

import { useNumberField } from '../../hooks/useNumberField';

export const NumberFieldDisplay = () => {
  const { fieldValue } = useNumberField();

  return <NumberDisplay value={fieldValue} />;
};
