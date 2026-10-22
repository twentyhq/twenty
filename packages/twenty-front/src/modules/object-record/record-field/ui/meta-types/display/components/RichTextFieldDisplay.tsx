import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';
import { getRichTextFieldTextLines } from '@/object-record/record-field/ui/utils/getRichTextFieldTextLines';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  return <TextDisplay text={getRichTextFieldTextLines(fieldValue)[0] ?? ''} />;
};
