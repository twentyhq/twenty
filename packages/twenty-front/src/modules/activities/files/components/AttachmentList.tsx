import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { lazy, type ReactElement, Suspense, useState } from 'react';
import { createPortal } from 'react-dom';

import { DropZone } from '@/activities/files/components/DropZone';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ModalContent, ModalHeader } from 'twenty-ui/layout';

import { ActivityList } from '@/activities/components/ActivityList';
import {
  type AttachmentWithFile,
  filterAttachmentsWithFile,
} from '@/activities/files/utils/filterAttachmentsWithFile';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { isDefined } from 'twenty-shared/utils';
import { IconDownload, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[6]}
    ${themeCssVariables.spacing[6]};
  width: calc(100% - ${themeCssVariables.spacing[12]});
  height: 100%;
`;

const StyledTitleBar = styled.h3`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledDropZoneContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  display: flex;
  height: 80vh;
  justify-content: center;
  width: 100%;
`;

const StyledLoadingText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-height: 40px;
`;

const StyledModalTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
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
    useState<AttachmentWithFile | null>(null);

  const isAttachmentPreviewEnabled = useAtomStateValue(
    isAttachmentPreviewEnabledState,
  );

  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  const { openModal, closeModal } = useModal();

  const attachmentsWithFile = filterAttachmentsWithFile(attachments);

  const onUploadFile = async (file: File) => {
    await uploadAttachmentFile(file, targetableObject);
  };

  const onUploadFiles = async (files: File[]) => {
    for (const file of files) {
      await onUploadFile(file);
    }
  };

  const handlePreview = (attachment: AttachmentWithFile) => {
    if (!isAttachmentPreviewEnabled) return;
    setPreviewedAttachment(attachment);
    openModal(PREVIEW_MODAL_ID);
  };

  const handleClosePreview = () => {
    closeModal(PREVIEW_MODAL_ID);
    setPreviewedAttachment(null);
  };

  const handleDownload = () => {
    if (!isDefined(previewedAttachment)) return;
    const attachmentUrl = getAttachmentUrl({ attachment: previewedAttachment });
    downloadFile(attachmentUrl, previewedAttachment.name);
  };

  return (
    <>
      {attachmentsWithFile.length > 0 && (
        <StyledContainer>
          <StyledTitleBar>
            <StyledTitle>
              {title} <StyledCount>{attachmentsWithFile.length}</StyledCount>
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
                {attachmentsWithFile.map((attachment) => (
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
          <ModalStatefulWrapper
            modalInstanceId={PREVIEW_MODAL_ID}
            size="large"
            isClosable
            onClose={handleClosePreview}
            renderInDocumentBody
            gap={2}
            padding="small"
          >
            <ModalHeader noPadding autoHeight>
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
            </ModalHeader>
            <ScrollWrapper
              componentInstanceId={`preview-modal-${previewedAttachment.id}`}
            >
              <ModalContent noPadding>
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
                    documentUrl={getAttachmentUrl({
                      attachment: previewedAttachment,
                    })}
                  />
                </Suspense>
              </ModalContent>
            </ScrollWrapper>
          </ModalStatefulWrapper>,
          document.body,
        )}
    </>
  );
};
