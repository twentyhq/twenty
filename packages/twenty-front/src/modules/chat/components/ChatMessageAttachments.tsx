import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { ChatMessageAttachment } from '@/chat/components/ChatMessageAttachment';
import { ChatMessageImageGrid } from '@/chat/components/ChatMessageImageGrid';
import { getChatMessageAttachmentGroups } from '@/chat/utils/getChatMessageAttachmentGroups';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const StyledAttachments = styled.div<{ isRightAligned: boolean }>`
  align-items: ${({ isRightAligned }) =>
    isRightAligned ? 'flex-end' : 'flex-start'};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:first-child {
    margin-top: 0;
  }
`;

const StyledStandaloneAttachments = styled.div<{ isRightAligned: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: ${({ isRightAligned }) =>
    isRightAligned ? 'flex-end' : 'flex-start'};
  width: 100%;
`;

type ChatMessageAttachmentsProps = {
  files: FieldFilesValue[];
  isRightAligned: boolean;
};

export const ChatMessageAttachments = ({
  files,
  isRightAligned,
}: ChatMessageAttachmentsProps) => {
  const { gridImages, standaloneAttachments } =
    getChatMessageAttachmentGroups(files);

  return (
    <StyledAttachments isRightAligned={isRightAligned}>
      {isNonEmptyArray(gridImages) && (
        <ChatMessageImageGrid files={gridImages} />
      )}
      {isNonEmptyArray(standaloneAttachments) && (
        <StyledStandaloneAttachments isRightAligned={isRightAligned}>
          {standaloneAttachments.map((attachment) => (
            <ChatMessageAttachment key={attachment.fileId} file={attachment} />
          ))}
        </StyledStandaloneAttachments>
      )}
    </StyledAttachments>
  );
};
