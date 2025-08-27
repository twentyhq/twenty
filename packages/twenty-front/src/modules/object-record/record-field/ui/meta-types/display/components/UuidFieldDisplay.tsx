import { TextDisplay } from '@/object-record/record-field/ui/meta-types/display/components/TextDisplay';
import { useUuidField } from '@/object-record/record-field/ui/meta-types/hooks/useUuidField';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
