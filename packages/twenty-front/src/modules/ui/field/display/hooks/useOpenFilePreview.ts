import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

export const useOpenFilePreview = () => {
  const setFilePreview = useSetAtomState(filePreviewState);
  const isAttachmentPreviewEnabled = useAtomStateValue(
    isAttachmentPreviewEnabledState,
  );

  const openFilePreview = (file: FieldFilesValue) => {
    if (!isAttachmentPreviewEnabled) {
      if (isDefined(file.url)) {
        downloadFile(file.url, file.label ?? 'file');
      }

      return;
    }

    setFilePreview(file);
  };

  return { openFilePreview };
};
