import { NumberDisplay } from 'twenty-ui';

import { useNumberField } from '../../hooks/useNumberField';

export const NumberFieldDisplay = () => {
  const { fieldValue } = useNumberField();

  return <NumberDisplay value={fieldValue} />;
};
