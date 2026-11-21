import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { isPlainObject, isValidUuid } from 'twenty-shared/utils';

const RICH_TEXT_SERIALIZED_SUBFIELD_NAMES = [
  'tiptap',
  'blocknote',
  'markdown',
] as const;

const FILES_FIELD_FILE_URL_PATTERN = new RegExp(
  `/file/${FileFolder.FilesField}/([0-9a-fA-F-]{36})`,
  'g',
);

// Matches file URLs in the serialized text so every subfield format is covered the same way.
export const extractFilesFieldFileIdsFromRichTextValue = (
  richTextValue: unknown,
): Set<string> => {
  const fileIds = new Set<string>();

  if (!isPlainObject(richTextValue)) {
    return fileIds;
  }

  for (const subfieldName of RICH_TEXT_SERIALIZED_SUBFIELD_NAMES) {
    const serializedValue = richTextValue[subfieldName];

    if (!isNonEmptyString(serializedValue)) {
      continue;
    }

    for (const [, fileId] of serializedValue.matchAll(
      FILES_FIELD_FILE_URL_PATTERN,
    )) {
      if (isValidUuid(fileId)) {
        fileIds.add(fileId.toLowerCase());
      }
    }
  }

  return fileIds;
};
