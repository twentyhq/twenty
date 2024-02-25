import { useFullNameField } from '@/object-record/record-field/meta-types/hooks/useFullNameField';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameField();

  const content = [fieldValue.firstName, fieldValue.lastName]
    .filter(Boolean)
    .join(' ');

  return <TextDisplay text={content} />;
};
