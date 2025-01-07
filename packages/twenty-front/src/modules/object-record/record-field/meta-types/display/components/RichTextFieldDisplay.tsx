import { useRichTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRichTextFieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';
import { PartialBlock } from '@blocknote/core';
import { parseJson } from '~/utils/parseJson';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  const blocks = parseJson<PartialBlock[]>(fieldValue?.blocknote);

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(blocks)}</span>
    </div>
  );
};
