import { TextDisplay } from '@/ui/object/field/meta-types/display/content-display/components/TextDisplay';
import { useUuidField } from '@/ui/object/field/meta-types/hooks/useUuidField';

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return <TextDisplay text={fieldValue} />;
};
