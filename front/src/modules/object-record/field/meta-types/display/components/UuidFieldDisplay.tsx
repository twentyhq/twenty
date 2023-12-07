import { useUuidField } from '@/object-record/field/meta-types/hooks/useUuidField';
import { TextDisplay } from '@/ui/field/components/TextDisplay';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
