import { useDateFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useDateFieldDisplay';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';

export const DateFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateFieldDisplay();

  const dateFieldSettings = fieldDefinition.metadata?.settings;

  return (
    <DateDisplay value={fieldValue} dateFieldSettings={dateFieldSettings} />
  );
};
