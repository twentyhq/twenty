import { useFullNameFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFullNameFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameFieldDisplay();

  const content = `${fieldValue?.firstName} ${fieldValue?.lastName}`;

  return <TextDisplay text={content} />;
};
