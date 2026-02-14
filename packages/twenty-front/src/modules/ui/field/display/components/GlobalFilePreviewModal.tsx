import { downloadFile } from '@/activities/files/utils/downloadFile';
import { filePreviewStateV2 } from '@/ui/field/display/states/filePreviewStateV2';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { lazy, Suspense, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconDownload, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

const GLOBAL_FILE_PREVIEW_MODAL_ID = 'global-file-preview-modal';

const StyledModalHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 60px;
  justify-content: space-between;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(0, 4, 0, 4)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  width: 100%;
`;

const StyledModalTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledModalContent = styled.div`
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const GlobalFilePreviewModal = (): JSX.Element | null => {
  const { t } = useLingui();
  const [filePreview, setFilePreview] = useRecoilStateV2(filePreviewStateV2);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (isDefined(filePreview)) {
      openModal(GLOBAL_FILE_PREVIEW_MODAL_ID);
    }
  }, [filePreview, openModal]);

  const handleClose = () => {
    closeModal(GLOBAL_FILE_PREVIEW_MODAL_ID);
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
    <>
      {createPortal(
        <Modal
          modalId={GLOBAL_FILE_PREVIEW_MODAL_ID}
          size="large"
          isClosable
          onClose={handleClose}
          ignoreContainer
        >
          <StyledModalHeader>
            <StyledHeader>
              <StyledModalTitle>{filePreview.label}</StyledModalTitle>
              <StyledButtonContainer>
                <IconButton
                  Icon={IconDownload}
                  onClick={handleDownload}
                  size="small"
                />
                <IconButton Icon={IconX} onClick={handleClose} size="small" />
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
        </Modal>,
        document.body,
      )}
    </>
  );
};
