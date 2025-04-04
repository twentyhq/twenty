import { useDateFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateFieldDisplay';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';

export const DateFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateFieldDisplay();

  const displayFormat = fieldDefinition.metadata?.settings?.displayFormat;

  return <DateDisplay value={fieldValue} displayFormat={displayFormat} />;
};
