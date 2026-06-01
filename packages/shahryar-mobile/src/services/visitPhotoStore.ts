import { Directory, File, Paths } from 'expo-file-system';

import {
  buildPersistedVisitPhotoUri,
  buildVisitPhotoDirectoryUri,
} from './visitPhotoPath';

export const persistVisitPhoto = async ({
  capturedAt,
  sourceUri,
}: {
  capturedAt: string;
  sourceUri: string;
}): Promise<string> => {
  const documentDirectoryUri = Paths.document.uri;
  const photoDirectoryUri = buildVisitPhotoDirectoryUri({
    documentDirectoryUri,
  });
  const persistedPhotoUri = buildPersistedVisitPhotoUri({
    capturedAt,
    documentDirectoryUri,
    sourceUri,
  });

  new Directory(photoDirectoryUri).create({
    idempotent: true,
    intermediates: true,
  });
  new File(sourceUri).copy(new File(persistedPhotoUri));

  return persistedPhotoUri;
};
