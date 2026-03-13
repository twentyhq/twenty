import { useRichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRichTextFieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/blocknote-editor/utils/getFirstNonEmptyLineOfRichText';
import type { PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useRichTextFieldDisplay();

  const blocks =
    isDefined(fieldValue) && isNonEmptyString(fieldValue.blocknote)
      ? parseJson<PartialBlock[]>(fieldValue.blocknote)
      : null;

  return (
    <div>
      <span>{getFirstNonEmptyLineOfRichText(blocks)}</span>
    </div>
  );
};
