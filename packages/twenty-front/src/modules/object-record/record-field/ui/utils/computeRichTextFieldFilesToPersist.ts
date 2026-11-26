import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

type RichTextFieldFile = Pick<FieldFilesValue, 'fileId' | 'label'>;

// Sent only when a file is added: a list read from a stale record must not make the server drop files it does not know about.
export const computeRichTextFieldFilesToPersist = ({
  listedFiles,
  uploadedFiles,
  serializedDocument,
}: {
  listedFiles: FieldFilesValue[];
  uploadedFiles: RichTextFieldFile[];
  serializedDocument: string;
}): RichTextFieldFile[] | undefined => {
  const listedFileIds = new Set(listedFiles.map(({ fileId }) => fileId));
  const filesToAdd = uploadedFiles.filter(
    ({ fileId }) =>
      !listedFileIds.has(fileId) && serializedDocument.includes(fileId),
  );

  if (filesToAdd.length === 0) {
    return undefined;
  }

  return [...listedFiles, ...filesToAdd].map(({ fileId, label }) => ({
    fileId,
    label,
  }));
};
