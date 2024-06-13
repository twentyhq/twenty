import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useLinksFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useLinksFieldDisplay';
import { LinksDisplay } from '@/ui/field/display/components/LinksDisplay';

export const LinksFieldDisplay = () => {
  const { fieldValue } = useLinksFieldDisplay();

  const { isFocused } = useFieldFocus();

  return <LinksDisplay value={fieldValue} isFocused={isFocused} />;
};
