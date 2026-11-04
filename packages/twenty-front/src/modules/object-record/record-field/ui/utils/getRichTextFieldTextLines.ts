import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  isDefined,
  parseTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRichTextFieldSerializedContent } from '@/object-record/record-field/ui/utils/getRichTextFieldSerializedContent';

const getInlineText = (node: TipTapNode): string => {
  switch (node.type) {
    case TIPTAP_NODE_TYPES.TEXT:
      return node.text ?? '';
    case TIPTAP_NODE_TYPES.HARD_BREAK:
      return ' ';
    case TIPTAP_NODE_TYPES.MENTION_TAG:
      return isString(node.attrs?.label) ? node.attrs.label : '';
    default:
      return (node.content ?? []).map(getInlineText).join('');
  }
};

const getTextBlocks = (node: TipTapNode): string[] => {
  switch (node.type) {
    case TIPTAP_NODE_TYPES.PARAGRAPH:
    case TIPTAP_NODE_TYPES.HEADING:
    case TIPTAP_NODE_TYPES.CODE_BLOCK:
      return [getInlineText(node)];
    default:
      return (node.content ?? []).flatMap(getTextBlocks);
  }
};

export const getRichTextFieldTextLines = (
  fieldValue: FieldRichTextValue | null | undefined,
): string[] => {
  const serializedDocument = getRichTextFieldSerializedContent(fieldValue);

  const document = isNonEmptyString(serializedDocument)
    ? parseTipTapJsonDocument(serializedDocument)
    : undefined;

  const lines = isDefined(document)
    ? getTextBlocks(document)
    : (fieldValue?.markdown ?? '').split('\n');

  return lines.map((line) => line.trim()).filter(isNonEmptyString);
};
