import { Dialog } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type JSX, lazy, Suspense, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconDownload, IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

const GLOBAL_FILE_PREVIEW_MODAL_ID = 'global-file-preview-modal';

const StyledModalHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  height: 60px;
  justify-content: space-between;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  width: 100%;
`;

const StyledModalTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledModalContent = styled.div`
  height: 100%;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

const StyledLoadingText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

export const GlobalFilePreviewModal = (): JSX.Element | null => {
  const { t } = useLingui();
  const [filePreview, setFilePreview] = useAtomState(filePreviewState);
  const { openDialog, closeDialog } = useDialog();

  useEffect(() => {
    if (isDefined(filePreview)) {
      openDialog(GLOBAL_FILE_PREVIEW_MODAL_ID);
    }
  }, [filePreview, openDialog]);

  const handleClose = () => {
    closeDialog(GLOBAL_FILE_PREVIEW_MODAL_ID);
    setFilePreview(null);
  };

  const handleDownload = () => {
    if (!filePreview || !filePreview.url) return;
    downloadFile(filePreview.url, filePreview.label ?? 'file');
  };

  if (!isDefined(filePreview)) {
    return null;
  }

  return (
    <DialogInstance
      dialogId={GLOBAL_FILE_PREVIEW_MODAL_ID}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          aria-label={filePreview.label ?? t`File preview`}
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="lg"
          style={{ padding: 'var(--t-spacing-4)' }}
        >
          <StyledModalHeader>
            <StyledHeader>
              <StyledModalTitle>{filePreview.label}</StyledModalTitle>
              <StyledButtonContainer>
                <IconButton
                  aria-label={t`Download file`}
                  onClick={handleDownload}
                  size="sm"
                >
                  <IconDownload />
                </IconButton>
                <IconButton
                  aria-label={t`Close preview`}
                  onClick={handleClose}
                  size="sm"
                >
                  <IconX />
                </IconButton>
              </StyledButtonContainer>
            </StyledHeader>
          </StyledModalHeader>
          <ScrollWrapper
            componentInstanceId={`preview-modal-${filePreview.fileId ?? 'file'}`}
          >
            <StyledModalContent>
              <Suspense
                fallback={
                  <StyledLoadingContainer>
                    <StyledLoadingText>
                      {t`Loading document viewer...`}
                    </StyledLoadingText>
                  </StyledLoadingContainer>
                }
              >
                <DocumentViewer
                  documentName={filePreview.label ?? t`Untitled`}
                  documentUrl={filePreview.url ?? ''}
                  documentExtension={filePreview.extension ?? ''}
                />
              </Suspense>
            </StyledModalContent>
          </ScrollWrapper>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
