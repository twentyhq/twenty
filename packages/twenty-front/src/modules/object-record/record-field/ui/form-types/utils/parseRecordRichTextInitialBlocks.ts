import { type PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const BLOCK_NOTE_BLOCK_TYPES = new Set([
  'audio',
  'bulletListItem',
  'checkListItem',
  'codeBlock',
  'divider',
  'file',
  'heading',
  'image',
  'numberedListItem',
  'paragraph',
  'quote',
  'table',
  'toggleListItem',
  'video',
]);

const isBlockNoteBlock = (value: unknown): boolean => {
  if (!isPlainObject(value)) {
    return false;
  }

  const blockType = (value as { type?: unknown }).type;

  return typeof blockType === 'string' && BLOCK_NOTE_BLOCK_TYPES.has(blockType);
};

export const parseRecordRichTextInitialBlocks = (
  value: FieldRichTextValue | undefined | null,
): PartialBlock[] | undefined => {
  const blocknote = value?.blocknote;

  if (isNonEmptyString(blocknote) && blocknote !== '{}') {
    let parsedBlocknote: unknown = undefined;

    try {
      parsedBlocknote = JSON.parse(blocknote);
    } catch {
      parsedBlocknote = undefined;
    }

    if (
      Array.isArray(parsedBlocknote) &&
      parsedBlocknote.length > 0 &&
      parsedBlocknote.every(isBlockNoteBlock)
    ) {
      return parsedBlocknote as PartialBlock[];
    }
  }

  const markdown = value?.markdown;

  if (isNonEmptyString(markdown)) {
    return [{ type: 'paragraph', content: markdown }] as PartialBlock[];
  }

  return undefined;
};
