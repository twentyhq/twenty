import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/blocknote-editor/utils/getFirstNonEmptyLineOfRichText';
import { readStoredBlocknote } from '@/blocknote-editor/utils/readStoredBlocknote';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  const { blocks } = readStoredBlocknote(fieldValue?.blocknote);

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(blocks ?? null)}</span>
    </div>
  );
};
