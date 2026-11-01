import { downloadFile } from '@/activities/files/utils/downloadFile';
import { FilePreviewDialog } from '@/ui/field/display/components/FilePreviewDialog';
import { GlobalFilePreviewOpenEffect } from '@/ui/field/display/components/GlobalFilePreviewOpenEffect';
import { GLOBAL_FILE_PREVIEW_MODAL_ID } from '@/ui/field/display/constants/GlobalFilePreviewModalId';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

const StyledLoadingText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

export const GlobalFilePreviewModal = () => {
  const { t } = useLingui();
  const [filePreview, setFilePreview] = useAtomState(filePreviewState);
  const { closeDialog } = useDialog();

  const handleClose = () => {
    closeDialog(GLOBAL_FILE_PREVIEW_MODAL_ID);
    setFilePreview(null);
  };

  const handleDownload = () => {
    if (!isDefined(filePreview) || !isNonEmptyString(filePreview.url)) {
      return;
    }
    downloadFile(filePreview.url, filePreview.label ?? 'file');
  };

  if (!isDefined(filePreview)) {
    return null;
  }

  return (
    <>
      <GlobalFilePreviewOpenEffect />
      <FilePreviewDialog
        dialogId={GLOBAL_FILE_PREVIEW_MODAL_ID}
        scrollWrapperId={`preview-modal-${filePreview.fileId ?? 'file'}`}
        title={filePreview.label ?? t`File preview`}
        documentName={filePreview.label ?? t`Untitled`}
        documentUrl={filePreview.url ?? ''}
        documentExtension={filePreview.extension ?? ''}
        onClose={handleClose}
        onDownload={handleDownload}
        downloadLabel={t`Download file`}
        loadingFallback={
          <StyledLoadingContainer>
            <StyledLoadingText>{t`Loading document viewer...`}</StyledLoadingText>
          </StyledLoadingContainer>
        }
      />
    </>
  );
};
