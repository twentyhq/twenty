const VISIT_PHOTO_DIRECTORY_NAME = 'shahryar-visit-photos';

const normalizeDirectoryUri = (directoryUri: string): string =>
  directoryUri.endsWith('/') ? directoryUri : `${directoryUri}/`;

const getSourceFileExtension = (sourceUri: string): string => {
  const sourcePath = sourceUri.split('?')[0];
  const sourceFileName = sourcePath.split('/').pop() ?? '';
  const extension =
    sourceFileName.includes('.') === true
      ? sourceFileName.split('.').pop()
      : undefined;

  return extension === undefined || extension.length === 0 ? 'jpg' : extension;
};

export const buildPersistedVisitPhotoFileName = ({
  capturedAt,
  sourceUri,
}: {
  capturedAt: string;
  sourceUri: string;
}): string => {
  const safeCapturedAt = capturedAt.replace(/[:.]/g, '-');
  const extension = getSourceFileExtension(sourceUri);

  return `visit-${safeCapturedAt}.${extension}`;
};

export const buildVisitPhotoDirectoryUri = ({
  documentDirectoryUri,
}: {
  documentDirectoryUri: string;
}): string =>
  `${normalizeDirectoryUri(documentDirectoryUri)}${VISIT_PHOTO_DIRECTORY_NAME}/`;

export const buildPersistedVisitPhotoUri = ({
  capturedAt,
  documentDirectoryUri,
  sourceUri,
}: {
  capturedAt: string;
  documentDirectoryUri: string;
  sourceUri: string;
}): string =>
  `${buildVisitPhotoDirectoryUri({
    documentDirectoryUri,
  })}${buildPersistedVisitPhotoFileName({ capturedAt, sourceUri })}`;
