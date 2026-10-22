import { GLOBAL_FILE_PREVIEW_MODAL_ID } from '@/ui/field/display/constants/GlobalFilePreviewModalId';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const GlobalFilePreviewOpenEffect = () => {
  const filePreview = useAtomStateValue(filePreviewState);
  const { openDialog } = useDialog();

  useEffect(() => {
    if (isDefined(filePreview)) {
      openDialog(GLOBAL_FILE_PREVIEW_MODAL_ID);
    }
  }, [filePreview, openDialog]);

  return null;
};
