import { DateTimeDisplayV2 } from '@/ui/field/display/components/DateTimeDisplayV2';

import { useDateTimeField } from '../../hooks/useDateTimeField';

export const DateTimeFieldDisplay = () => {
  const { fieldValue } = useDateTimeField();

  return <DateTimeDisplayV2 value={fieldValue} />;
};
