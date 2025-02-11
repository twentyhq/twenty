import { useRichTextV2FieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRichTextV2FieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';
import { PartialBlock } from '@blocknote/core';
import { parseJson } from '~/utils/parseJson';

export const RichTextV2FieldDisplay = () => {
  const { fieldValue } = useRichTextV2FieldDisplay();

  const blocks = parseJson<PartialBlock[]>(fieldValue?.blocknote);

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(blocks)}</span>
    </div>
  );
};
