import { useUuidField } from '@/object-record/record-field/ui/meta-types/hooks/useUuidField';
import { TextDisplay } from 'twenty-ui/primitives/data-display';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
