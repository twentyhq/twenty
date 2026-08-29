import { isNonEmptyString, isObject } from '@sniptt/guards';

type FilesFieldValueEntry = Record<string, unknown> & { fileId: string };

const isFilesFieldValueEntry = (
  entry: unknown,
): entry is FilesFieldValueEntry =>
  isObject(entry) &&
  isNonEmptyString((entry as Record<string, unknown>).fileId);

export const collectFileIdsFromFilesFieldValue = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isFilesFieldValueEntry).map((entry) => entry.fileId);
};

export const substituteFileIdsInFilesFieldValue = (
  value: unknown,
  fileIdSubstitutions: Map<string, string>,
): unknown => {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((entry) =>
    isFilesFieldValueEntry(entry) && fileIdSubstitutions.has(entry.fileId)
      ? { ...entry, fileId: fileIdSubstitutions.get(entry.fileId) }
      : entry,
  );
};
