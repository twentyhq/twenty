import { useTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useTextFieldDisplay';
import { getFirstNonEmptyLineOfRichText } from '@/ui/input/editor/utils/getFirstNonEmptyLineOfRichText';
import { PartialBlock } from '@blocknote/core';

export const RichTextFieldDisplay = () => {
  const { fieldValue } = useTextFieldDisplay();
  const parsedField =
    fieldValue === '' ? null : (JSON.parse(fieldValue) as PartialBlock[]);

  return <>{getFirstNonEmptyLineOfRichText(parsedField)}</>;
};
