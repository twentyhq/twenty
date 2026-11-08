import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useOpenFilePreview = () => {
  const store = useStore();
  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  const openFilePreview = useCallback(
    (file: FieldFilesValue) => {
      if (!store.get(isAttachmentPreviewEnabledState.atom)) {
        if (hasDownloadPermission && isNonEmptyString(file.url)) {
          downloadFile(file.url, file.label ?? 'file');
        }

        return;
      }

      store.set(filePreviewState.atom, file);
    },
    [store, hasDownloadPermission],
  );

  return { openFilePreview };
};
