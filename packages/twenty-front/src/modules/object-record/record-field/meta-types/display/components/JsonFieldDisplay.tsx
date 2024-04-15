import { useJsonField } from '@/object-record/record-field/meta-types/hooks/useJsonField';
import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';

export const JsonFieldDisplay = () => {
  const { fieldValue, maxWidth } = useJsonField();

  return (
    <JsonDisplay
      text={fieldValue ? JSON.stringify(JSON.parse(fieldValue), null, 2) : ''}
      maxWidth={maxWidth}
    />
  );
};
