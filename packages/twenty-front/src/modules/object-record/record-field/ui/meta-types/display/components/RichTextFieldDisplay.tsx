import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { RichTextLineDisplay } from '@/blocknote-editor/components/RichTextLineDisplay';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  const blocks = parseInitialBlocknote(fieldValue?.blocknote) ?? null;

  return <RichTextLineDisplay blocks={blocks} />;
};
