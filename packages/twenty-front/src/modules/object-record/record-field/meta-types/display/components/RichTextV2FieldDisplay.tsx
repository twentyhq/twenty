import { useRichTextV2FieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRichTextV2FieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';
import type { PartialBlock } from '@blocknote/core';
import { isDefined, parseJson } from 'twenty-shared/utils';

export const RichTextV2FieldDisplay = () => {
  const { fieldValue } = useRichTextV2FieldDisplay();

  const blocks =
    isDefined(fieldValue) && isDefined(fieldValue.blocknote)
      ? parseJson<PartialBlock[]>(fieldValue.blocknote)
      : null;

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(blocks)}</span>
    </div>
  );
};
