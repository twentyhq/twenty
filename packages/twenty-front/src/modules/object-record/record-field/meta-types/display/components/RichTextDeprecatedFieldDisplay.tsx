import { useRichTextDeprecatedFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRichTextDeprecatedFieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';

export const RichTextDeprecatedFieldDisplay = () => {
  const { fieldValue } = useRichTextDeprecatedFieldDisplay();

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(fieldValue)}</span>
    </div>
  );
};
