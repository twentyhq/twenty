import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

import { useDateTimeField } from '../../hooks/useDateTimeField';

export const DateTimeFieldDisplay = () => {
  const { fieldValue } = useDateTimeField();

  return <DateTimeDisplay value={fieldValue} />;
};
