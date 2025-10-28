import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(fieldValue)}</span>
    </div>
  );
};
