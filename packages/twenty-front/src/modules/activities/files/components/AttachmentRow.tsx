import { ActivityRow } from '@/activities/components/ActivityRow';
import { AttachmentDropdown } from '@/activities/files/components/AttachmentDropdown';
import { type Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  type GenericFieldContextType,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FileIcon } from '@/file/components/FileIcon';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { IconCalendar, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { isNavigationModifierPressed } from 'twenty-ui/utilities';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

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

type AttachmentRowProps = {
  attachment: Attachment;
  onPreview?: (attachment: Attachment) => void;
};

export const AttachmentRow = ({
  attachment,
  onPreview,
}: AttachmentRowProps) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const hasDownloadPermission = useHasPermissionFlag(
    PermissionFlagType.DOWNLOAD_FILE,
  );

  const { name: originalFileName, extension: attachmentFileExtension } =
    getFileNameAndExtension(attachment.name);

  const [attachmentFileName, setAttachmentFileName] =
    useState(originalFileName);

  const { destroyOneRecord: destroyOneAttachment } = useDestroyOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const handleDelete = () => {
    destroyOneAttachment(attachment.id);
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

  const handleOpenDocument = (e: React.MouseEvent) => {
    // Cmd/Ctrl+click opens new tab, right click opens context menu
    if (isNavigationModifierPressed(e) === true) {
      return;
    }

    // Only prevent default and use preview if onPreview is provided
    if (isDefined(onPreview)) {
      e.preventDefault();
      onPreview(attachment);
    }
  };

  return (
    <FieldContext.Provider
      value={
        {
          recordId: attachment.id,
        } as GenericFieldContextType
      }
    >
      <ActivityRow disabled>
        <StyledLeftContent>
          <FileIcon fileCategory={attachment.fileCategory} />
          {isEditing ? (
            <SettingsTextInput
              instanceId={`attachment-${attachment.id}-name`}
              value={attachmentFileName}
              onChange={handleOnChange}
              onBlur={handleOnBlur}
              autoFocus
              onKeyDown={handleOnKeyDown}
            />
          ) : (
            <StyledLinkContainer>
              <StyledLink
                onClick={handleOpenDocument}
                href={attachment.fullPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OverflowingTextWithTooltip text={attachment.name} />
              </StyledLink>
            </StyledLinkContainer>
          )}
        </StyledLeftContent>
        <StyledRightContent>
          <StyledCalendarIconContainer>
            <IconCalendar size={theme.icon.size.md} />
          </StyledCalendarIconContainer>
          {formatToHumanReadableDate(attachment.createdAt)}
          <AttachmentDropdown
            attachmentId={attachment.id}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onRename={handleRename}
            hasDownloadPermission={hasDownloadPermission}
          />
        </StyledRightContent>
      </ActivityRow>
    </FieldContext.Provider>
  );
};
