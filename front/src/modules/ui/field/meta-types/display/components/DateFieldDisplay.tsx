import { DateDisplay } from '@/ui/field/meta-types/display/content-display/components/DateDisplay';

import { useDateField } from '../../hooks/useDateField';

export const DateFieldDisplay = () => {
  const { fieldValue } = useDateField();

  return <DateDisplay value={fieldValue} />;
};
