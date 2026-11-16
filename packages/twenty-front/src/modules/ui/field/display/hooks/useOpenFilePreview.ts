import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { filePreviewGalleryFilesState } from '@/ui/field/display/states/filePreviewGalleryFilesState';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type OpenFilePreviewGalleryArgs = {
  file: FieldFilesValue;
  galleryFiles: FieldFilesValue[];
};

export const useOpenFilePreview = () => {
  const store = useStore();
  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  const openFilePreviewGallery = useCallback(
    ({ file, galleryFiles }: OpenFilePreviewGalleryArgs) => {
      if (!store.get(isAttachmentPreviewEnabledState.atom)) {
        if (hasDownloadPermission && isNonEmptyString(file.url)) {
          downloadFile(file.url, file.label ?? 'file');
        }

        return;
      }

      store.set(filePreviewGalleryFilesState.atom, galleryFiles);
      store.set(filePreviewState.atom, file);
    },
    [store, hasDownloadPermission],
  );

  const openFilePreview = useCallback(
    (file: FieldFilesValue) =>
      openFilePreviewGallery({ file, galleryFiles: [] }),
    [openFilePreviewGallery],
  );

  return { openFilePreview, openFilePreviewGallery };
};
