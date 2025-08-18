import { useUuidField } from '@/object-record/record-field/ui/meta-types/hooks/useUuidField';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
