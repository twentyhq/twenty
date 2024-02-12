import { DateDisplay } from '@/ui/field/display/components/DateDisplay';

import { useDateTimeField } from '../../hooks/useDateTimeField';

export const DateFieldDisplay = () => {
  const { fieldValue } = useDateTimeField();

  return <DateDisplay value={fieldValue} />;
};
