import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';

export const useOpenFilePreview = () => {
  const store = useStore();

  const openFilePreview = useCallback(
    (file: FieldFilesValue) => {
      if (!store.get(isAttachmentPreviewEnabledState.atom)) {
        if (isNonEmptyString(file.url)) {
          downloadFile(file.url, file.label ?? 'file');
        }

        return;
      }

      store.set(filePreviewState.atom, file);
    },
    [store],
  );

  return { openFilePreview };
};
