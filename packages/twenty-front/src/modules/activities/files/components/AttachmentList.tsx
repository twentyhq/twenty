import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { lazy, type ReactElement, Suspense, useState } from 'react';
import { createPortal } from 'react-dom';

import { DropZone } from '@/activities/files/components/DropZone';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useRecoilValue } from 'recoil';

import { ActivityList } from '@/activities/components/ActivityList';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { IconDownload, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { AttachmentRow } from './AttachmentRow';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

type AttachmentListProps = {
  targetableObject: ActivityTargetableObject;
  title: string;
  attachments: Attachment[];
  button?: ReactElement | false | null;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2, 6, 6)};
  width: calc(100% - ${({ theme }) => theme.spacing(12)});
  height: 100%;
`;

const StyledTitleBar = styled.h3`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledDropZoneContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  height: 80vh;
  justify-content: center;
  width: 100%;
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-height: 40px;
`;

const StyledModalTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledModalHeader = styled(Modal.Header)`
  height: auto;
  padding: 0;
`;

const StyledModalContent = styled(Modal.Content)`
  padding: 0;
`;

const StyledModal = styled(Modal)`
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const PREVIEW_MODAL_ID = 'preview-modal';

export const AttachmentList = ({
  targetableObject,
  title,
  attachments,
  button,
}: AttachmentListProps) => {
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [previewedAttachment, setPreviewedAttachment] =
    useState<Attachment | null>(null);

  const isAttachmentPreviewEnabled = useRecoilValue(
    isAttachmentPreviewEnabledState,
  );

  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  const { openModal, closeModal } = useModal();

  const onUploadFile = async (file: File) => {
    await uploadAttachmentFile(file, targetableObject);
  };

  const onUploadFiles = async (files: File[]) => {
    for (const file of files) {
      await onUploadFile(file);
    }
  };

  const handlePreview = (attachment: Attachment) => {
    if (!isAttachmentPreviewEnabled) return;
    setPreviewedAttachment(attachment);
    openModal(PREVIEW_MODAL_ID);
  };

  const handleClosePreview = () => {
    closeModal(PREVIEW_MODAL_ID);
    setPreviewedAttachment(null);
  };

  const handleDownload = () => {
    if (!previewedAttachment) return;
    downloadFile(previewedAttachment.fullPath, previewedAttachment.name);
  };

  return (
    <>
      {attachments && attachments.length > 0 && (
        <StyledContainer>
          <StyledTitleBar>
            <StyledTitle>
              {title} <StyledCount>{attachments.length}</StyledCount>
            </StyledTitle>
            {button}
          </StyledTitleBar>
          <StyledDropZoneContainer
            onDragEnter={() => hasUploadPermission && setIsDraggingFile(true)}
          >
            {isDraggingFile && hasUploadPermission ? (
              <DropZone
                setIsDraggingFile={setIsDraggingFile}
                onUploadFiles={onUploadFiles}
              />
            ) : (
              <ActivityList>
                {attachments.map((attachment) => (
                  <AttachmentRow
                    key={attachment.id}
                    attachment={attachment}
                    onPreview={
                      isAttachmentPreviewEnabled ? handlePreview : undefined
                    }
                  />
                ))}
              </ActivityList>
            )}
          </StyledDropZoneContainer>
        </StyledContainer>
      )}
      {previewedAttachment &&
        isAttachmentPreviewEnabled &&
        createPortal(
          <StyledModal
            modalId={PREVIEW_MODAL_ID}
            size="large"
            isClosable
            onClose={handleClosePreview}
            ignoreContainer
          >
            <StyledModalHeader>
              <StyledHeader>
                <StyledModalTitle>{previewedAttachment.name}</StyledModalTitle>
                <StyledButtonContainer>
                  {hasDownloadPermission && (
                    <IconButton
                      Icon={IconDownload}
                      onClick={handleDownload}
                      size="small"
                    />
                  )}
                  <IconButton
                    Icon={IconX}
                    onClick={handleClosePreview}
                    size="small"
                  />
                </StyledButtonContainer>
              </StyledHeader>
            </StyledModalHeader>
            <ScrollWrapper
              componentInstanceId={`preview-modal-${previewedAttachment.id}`}
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
                    documentName={previewedAttachment.name}
                    documentUrl={previewedAttachment.fullPath}
                  />
                </Suspense>
              </StyledModalContent>
            </ScrollWrapper>
          </StyledModal>,
          document.body,
        )}
    </>
  );
};
