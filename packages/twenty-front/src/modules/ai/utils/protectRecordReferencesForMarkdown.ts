import { findRecordReferences } from '@/ai/utils/findRecordReferences';
import { formatRecordReference } from '@/ai/utils/formatRecordReference';

const escapeMarkdown = (text: string): string =>
  text.replace(/([\\`*_{}[\]()#+\-.!|~>])/g, '\\$1');

export const protectRecordReferencesForMarkdown = (text: string): string => {
  const references = findRecordReferences(text);
  let result = text;

  for (let index = references.length - 1; index >= 0; index--) {
    const reference = references[index];
    const replacement = formatRecordReference({
      objectNameSingular: reference.objectNameSingular,
      recordId: reference.recordId,
      displayName: escapeMarkdown(reference.displayName),
    });

    result =
      result.slice(0, reference.index) +
      replacement +
      result.slice(reference.index + reference.fullMatch.length);
  }

  return result;
};
