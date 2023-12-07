import { DateDisplay } from '@/object-record/field/meta-types/display/content-display/components/DateDisplay';

import { useDateTimeField } from '../../hooks/useDateTimeField';

export const DateFieldDisplay = () => {
  const { fieldValue } = useDateTimeField();

  return <DateDisplay value={fieldValue} />;
};
