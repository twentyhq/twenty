import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';
import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { getFirstNonEmptyLineOfRichText } from '@/blocknote-editor/utils/getFirstNonEmptyLineOfRichText';
import { filterBlocksSupportedBySchema } from '@/blocknote-editor/utils/filterBlocksSupportedBySchema';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  const blocks =
    filterBlocksSupportedBySchema(
      parseInitialBlocknote(fieldValue?.blocknote),
      BLOCK_SCHEMA.blockSchema,
    ) ?? null;

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(blocks)}</span>
    </div>
  );
};
