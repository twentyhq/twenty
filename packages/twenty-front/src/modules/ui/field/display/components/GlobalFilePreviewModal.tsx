import { downloadFile } from '@/activities/files/utils/downloadFile';
import { FilePreviewDialog } from '@/ui/field/display/components/FilePreviewDialog';
import { GlobalFilePreviewOpenEffect } from '@/ui/field/display/components/GlobalFilePreviewOpenEffect';
import { GLOBAL_FILE_PREVIEW_MODAL_ID } from '@/ui/field/display/constants/GlobalFilePreviewModalId';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { filePreviewGalleryFilesState } from '@/ui/field/display/states/filePreviewGalleryFilesState';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { getFilePreviewGalleryNavigation } from '@/ui/field/display/utils/getFilePreviewGalleryNavigation';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

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
  const [filePreviewGalleryFiles, setFilePreviewGalleryFiles] = useAtomState(
    filePreviewGalleryFilesState,
  );
  const { closeDialog } = useDialog();
  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  const handleClose = () => {
    closeDialog(GLOBAL_FILE_PREVIEW_MODAL_ID);
    setFilePreview(null);
    setFilePreviewGalleryFiles([]);
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

  const galleryNavigation = getFilePreviewGalleryNavigation({
    galleryFiles: filePreviewGalleryFiles,
    fileId: filePreview.fileId,
    onSelectFile: setFilePreview,
  });

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
        positionLabel={galleryNavigation?.positionLabel}
        onPrevious={galleryNavigation?.onPrevious}
        onNext={galleryNavigation?.onNext}
        onDownload={hasDownloadPermission ? handleDownload : undefined}
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
