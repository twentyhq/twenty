import { NumberDisplay } from '@/ui/Data/Field/meta-types/display/content-display/components/NumberDisplay';

import { useNumberField } from '../../hooks/useNumberField';

export const NumberFieldDisplay = () => {
  const { fieldValue } = useNumberField();

  return <NumberDisplay value={fieldValue} />;
};
