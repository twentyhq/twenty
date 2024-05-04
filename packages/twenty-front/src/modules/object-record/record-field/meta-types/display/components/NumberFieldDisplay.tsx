import { NumberDisplayV2 } from '@/ui/field/display/components/NumberDisplayV2';

import { useNumberField } from '../../hooks/useNumberField';

export const NumberFieldDisplay = () => {
  const { fieldValue } = useNumberField();

  return <NumberDisplayV2 value={fieldValue} />;
};
