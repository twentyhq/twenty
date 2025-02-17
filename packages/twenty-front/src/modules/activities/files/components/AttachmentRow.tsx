import { ActivityRow } from '@/activities/components/ActivityRow';
import { AttachmentDropdown } from '@/activities/files/components/AttachmentDropdown';
import { AttachmentIcon } from '@/activities/files/components/AttachmentIcon';
import { Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  GenericFieldContextType,
} from '@/object-record/record-field/contexts/FieldContext';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense, useMemo, useState } from 'react';
import {
  IconCalendar,
  IconX,
  LightIconButton,
  OverflowingTextWithTooltip,
} from 'twenty-ui';

import { formatToHumanReadableDate } from '~/utils/date-utils';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const DocumentViewerContent = lazy(() =>
  import('@/activities/files/components/DocumentViewerModal').then(
    (module) => ({
      default: module.DocumentViewerContent,
    }),
  ),
);

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};

  width: 100%;
  overflow: auto;
  flex: 1;
`;

const StyledRightContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledCalendarIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
`;

const StyledLink = styled.a`
  align-items: center;
  appearance: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  text-align: left;
  text-decoration: none;
  width: 100%;

  :hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledLinkContainer = styled.div`
  overflow: auto;
  width: 100%;
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
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

export const AttachmentRow = ({ attachment }: { attachment: Attachment }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);

  const { name: originalFileName, extension: attachmentFileExtension } =
    getFileNameAndExtension(attachment.name);

  const [attachmentFileName, setAttachmentFileName] =
    useState(originalFileName);

  const fieldContext = useMemo(
    () => ({ recoilScopeId: attachment?.id ?? '' }),
    [attachment?.id],
  );

  const { deleteOneRecord: deleteOneAttachment } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const handleDelete = () => {
    deleteOneAttachment(attachment.id);
  };

  const { updateOneRecord: updateOneAttachment } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const handleRename = () => {
    setIsEditing(true);
  };

  const saveAttachmentName = () => {
    setIsEditing(false);

    const newFileName = `${attachmentFileName}${attachmentFileExtension}`;

    updateOneAttachment({
      idToUpdate: attachment.id,
      updateOneRecordInput: { name: newFileName },
    });
  };

  const handleOnBlur = () => {
    saveAttachmentName();
  };

  const handleOnChange = (newFileName: string) => {
    setAttachmentFileName(newFileName);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveAttachmentName();
    }
  };

  const handleDownload = () => {
    downloadFile(
      attachment.fullPath,
      `${attachmentFileName}${attachmentFileExtension}`,
    );
  };

  const handleOpenDocument = () => {
    setIsDocumentViewerOpen(true);
  };

  const isViewableDocument = [
    'TextDocument',
    'Presentation',
    'Spreadsheet',
    'Image',
  ].includes(attachment.type);

  return (
    <FieldContext.Provider value={fieldContext as GenericFieldContextType}>
      <ActivityRow disabled>
        <StyledLeftContent>
          <AttachmentIcon attachmentType={attachment.type} />
          {isEditing ? (
            <TextInput
              value={attachmentFileName}
              onChange={handleOnChange}
              onBlur={handleOnBlur}
              autoFocus
              onKeyDown={handleOnKeyDown}
            />
          ) : (
            <StyledLinkContainer>
              {isViewableDocument ? (
                <StyledLink as="button" onClick={handleOpenDocument}>
                  <OverflowingTextWithTooltip text={attachment.name} />
                </StyledLink>
              ) : (
                <StyledLink
                  href={attachment.fullPath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OverflowingTextWithTooltip text={attachment.name} />
                </StyledLink>
              )}
            </StyledLinkContainer>
          )}
        </StyledLeftContent>
        <StyledRightContent>
          <StyledCalendarIconContainer>
            <IconCalendar size={theme.icon.size.md} />
          </StyledCalendarIconContainer>
          {formatToHumanReadableDate(attachment.createdAt)}
          <AttachmentDropdown
            scopeKey={attachment.id}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onRename={handleRename}
          />
        </StyledRightContent>
      </ActivityRow>
      {isDocumentViewerOpen && (
        <Modal
          size="large"
          isClosable
          onClose={() => setIsDocumentViewerOpen(false)}
        >
          <Modal.Header>
            <StyledHeader>
              <StyledTitle>{attachment.name}</StyledTitle>
              <LightIconButton
                Icon={IconX}
                onClick={() => setIsDocumentViewerOpen(false)}
                accent="tertiary"
              />
            </StyledHeader>
          </Modal.Header>
          <Modal.Content>
            <Suspense
              fallback={
                <StyledLoadingContainer>
                  <StyledLoadingText>
                    Loading document viewer...
                  </StyledLoadingText>
                </StyledLoadingContainer>
              }
            >
              <DocumentViewerContent
                documentName={attachment.name}
                documentUrl={attachment.fullPath}
              />
            </Suspense>
          </Modal.Content>
        </Modal>
      )}
    </FieldContext.Provider>
  );
};
