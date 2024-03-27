import { DateDisplay } from 'twenty-ui';

import { useDateTimeField } from '../../hooks/useDateTimeField';

export const DateFieldDisplay = () => {
  const { fieldValue } = useDateTimeField();

  return <DateDisplay value={fieldValue} />;
};
