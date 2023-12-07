import { TextDisplay } from '@/object-record/field/meta-types/display/content-display/components/TextDisplay';
import { useUuidField } from '@/object-record/field/meta-types/hooks/useUuidField';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
