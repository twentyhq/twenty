import { Dialog } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { lazy, Suspense, useState } from 'react';

import { DropZone } from '@/activities/files/components/DropZone';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { ActivityList } from '@/activities/components/ActivityList';
import {
  type AttachmentWithFile,
  filterAttachmentsWithFile,
} from '@/activities/files/utils/filterAttachmentsWithFile';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { isDefined } from 'twenty-shared/utils';
import { IconDownload, IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
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
  attachments: Attachment[];
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

const StyledDropZoneContainer = styled.div`
  flex: 1;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  display: flex;
  height: calc(80vh / var(--t-zoom, 1));
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
  min-height: 40px;
  width: 100%;
`;

const StyledModalTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
`;

const PREVIEW_MODAL_ID = 'preview-modal';

export const AttachmentList = ({
  targetableObject,
  attachments,
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

  const { openDialog, closeDialog } = useDialog();

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
    openDialog(PREVIEW_MODAL_ID);
  };

  const handleClosePreview = () => {
    closeDialog(PREVIEW_MODAL_ID);
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
      {previewedAttachment && isAttachmentPreviewEnabled && (
        <DialogInstance
          dialogId={PREVIEW_MODAL_ID}
          dismissible
          onClose={handleClosePreview}
          renderInDocumentBody
        >
          {({ container, backdrop, viewportProps, onKeyDown }) => (
            <Dialog.Popup
              aria-label={previewedAttachment.name}
              {...{ container, backdrop, viewportProps, onKeyDown }}
              size="lg"
              style={{
                padding: 'var(--t-spacing-2)',
                gap: 'var(--t-spacing-2)',
              }}
            >
              <Dialog.Header
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 'auto',
                  padding: 0,
                }}
              >
                <StyledHeader>
                  <StyledModalTitle>
                    {previewedAttachment.name}
                  </StyledModalTitle>
                  <StyledButtonContainer>
                    {hasDownloadPermission && (
                      <IconButton
                        aria-label={t`Download attachment`}
                        onClick={handleDownload}
                        size="sm"
                      >
                        <IconDownload />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label={t`Close preview`}
                      onClick={handleClosePreview}
                      size="sm"
                    >
                      <IconX />
                    </IconButton>
                  </StyledButtonContainer>
                </StyledHeader>
              </Dialog.Header>
              <ScrollWrapper
                componentInstanceId={`preview-modal-${previewedAttachment.id}`}
              >
                <Dialog.Body
                  style={{
                    display: 'flex',
                    flex: '1 1 0%',
                    flexDirection: 'column',
                    padding: 0,
                  }}
                >
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
                </Dialog.Body>
              </ScrollWrapper>
            </Dialog.Popup>
          )}
        </DialogInstance>
      )}
    </>
  );
};
