import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/blocknote-editor/utils/getFirstNonEmptyLineOfRichText';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  const blocks = parseInitialBlocknote(fieldValue?.blocknote) ?? null;

  return <TextDisplay text={getFirstNonEmptyLineOfRichText(blocks)} />;
};
