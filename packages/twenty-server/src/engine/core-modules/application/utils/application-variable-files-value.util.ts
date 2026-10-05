import path from 'path';

import {
  type ApplicationVariableFileValue,
  isApplicationVariableFileValue,
  parseApplicationVariableFilesValue,
  toStoredApplicationVariableFileValue,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

export type ApplicationVariableFilesValueUpdate = {
  plaintextValueToStore: string;
  fileIdsToBind: string[];
  fileIdsToDelete: string[];
};

export type ApplicationVariableFilesValueInputValidation =
  | { isValid: true; files: ApplicationVariableFileValue[] }
  | { isValid: false; error: string };

export const validateApplicationVariableFilesValueInput = (
  plaintextValue: string,
): ApplicationVariableFilesValueInputValidation => {
  if (plaintextValue === '') {
    return { isValid: true, files: [] };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(plaintextValue);
  } catch {
    return { isValid: false, error: 'files value is not valid JSON' };
  }

  if (
    !Array.isArray(parsedValue) ||
    !parsedValue.every(isApplicationVariableFileValue)
  ) {
    return { isValid: false, error: 'files value must be a list of files' };
  }

  const fileIds = parsedValue.map(({ fileId }) => fileId);

  if (new Set(fileIds).size !== fileIds.length) {
    return { isValid: false, error: 'files value lists the same file twice' };
  }

  return { isValid: true, files: parsedValue };
};

export const diffApplicationVariableFilesValue = ({
  previousPlaintextValue,
  nextFiles,
}: {
  previousPlaintextValue: string;
  nextFiles: ApplicationVariableFileValue[];
}): {
  previousFileById: Map<string, ApplicationVariableFileValue>;
  fileIdsToBind: string[];
  fileIdsToDelete: string[];
} => {
  const previousFileById = new Map(
    parseApplicationVariableFilesValue(previousPlaintextValue).map((file) => [
      file.fileId,
      file,
    ]),
  );
  const nextFileIds = new Set(nextFiles.map(({ fileId }) => fileId));

  return {
    previousFileById,
    fileIdsToBind: nextFiles
      .filter(({ fileId }) => !previousFileById.has(fileId))
      .map(({ fileId }) => fileId),
    fileIdsToDelete: [...previousFileById.keys()].filter(
      (fileId) => !nextFileIds.has(fileId),
    ),
  };
};

// The extension comes from the stored path, never from the client
export const serializeApplicationVariableFilesValueToStore = ({
  nextFiles,
  previousFileById,
  uploadedFileById,
}: {
  nextFiles: ApplicationVariableFileValue[];
  previousFileById: Map<string, ApplicationVariableFileValue>;
  uploadedFileById: Map<string, Pick<FileEntity, 'path'>>;
}): string => {
  const filesToStore = nextFiles.map(({ fileId, label }) => {
    const uploadedFile = uploadedFileById.get(fileId);

    return toStoredApplicationVariableFileValue({
      fileId,
      label,
      extension: isDefined(uploadedFile)
        ? path.extname(uploadedFile.path)
        : previousFileById.get(fileId)?.extension,
    });
  });

  return filesToStore.length === 0 ? '' : JSON.stringify(filesToStore);
};
