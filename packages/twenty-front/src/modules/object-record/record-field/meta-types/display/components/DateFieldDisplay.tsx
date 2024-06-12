import { useDateFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateFieldDisplay';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';

export const DateFieldDisplay = () => {
  const { fieldValue } = useDateFieldDisplay();

  return <DateDisplay value={fieldValue} />;
};
