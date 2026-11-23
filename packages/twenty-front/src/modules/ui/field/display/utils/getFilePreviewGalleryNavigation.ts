import { isDefined } from 'twenty-shared/utils';

import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

type GetFilePreviewGalleryNavigationArgs = {
  galleryFiles: FieldFilesValue[];
  fileId: string;
  onSelectFile: (file: FieldFilesValue) => void;
};

type FilePreviewGalleryNavigation = {
  positionLabel: string;
  onPrevious?: () => void;
  onNext?: () => void;
};

export const getFilePreviewGalleryNavigation = ({
  galleryFiles,
  fileId,
  onSelectFile,
}: GetFilePreviewGalleryNavigationArgs):
  | FilePreviewGalleryNavigation
  | undefined => {
  const index = galleryFiles.findIndex(
    (galleryFile) => galleryFile.fileId === fileId,
  );

  if (galleryFiles.length < 2 || index === -1) {
    return undefined;
  }

  const previousFile = galleryFiles[index - 1];
  const nextFile = galleryFiles[index + 1];

  return {
    positionLabel: `${index + 1} / ${galleryFiles.length}`,
    onPrevious: isDefined(previousFile)
      ? () => onSelectFile(previousFile)
      : undefined,
    onNext: isDefined(nextFile) ? () => onSelectFile(nextFile) : undefined,
  };
};
