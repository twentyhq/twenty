import { TextDisplay } from '@/object-record/record-field/ui/meta-types/display/components/TextDisplay';
import { useFullNameFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameFieldDisplay';
import { isNonEmptyString } from '@sniptt/guards';

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

  return <TextDisplay text={content} />;
};
