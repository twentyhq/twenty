import { useFullNameFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameFieldDisplay';
import { formatFullNameFieldValue } from '@/object-record/record-field/ui/utils/formatFullNameFieldValue';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameFieldDisplay();

  return <TextDisplay text={formatFullNameFieldValue(fieldValue)} />;
};
