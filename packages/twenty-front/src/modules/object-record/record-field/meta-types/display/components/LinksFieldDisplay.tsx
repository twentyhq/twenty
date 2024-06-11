import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useLinksField } from '@/object-record/record-field/meta-types/hooks/useLinksField';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';

export const LinksFieldDisplay = () => {
  const { fieldValue } = useLinksField();

  const { isFocused } = useFieldFocus();

  return <LinksDisplay value={fieldValue} isFocused={isFocused} />;
};
