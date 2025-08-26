import { useUuidField } from '@/object-record/record-field/ui/meta-types/hooks/useUuidField';
import { TextDisplay } from 'twenty-ui/fields';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
