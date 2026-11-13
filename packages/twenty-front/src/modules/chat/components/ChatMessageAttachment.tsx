import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { ChatMessageVoiceNote } from '@/chat/components/ChatMessageVoiceNote';
import { CHAT_MESSAGE_BUBBLE_MAX_WIDTH } from '@/chat/constants/ChatMessageBubbleMaxWidth';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { useOpenFilePreview } from '@/ui/field/display/hooks/useOpenFilePreview';
import { FILE_CATEGORIES } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const CHAT_MESSAGE_MEDIA_MAX_HEIGHT = '240px';

const StyledImageButton = styled.button`
  background: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: block;
  max-width: ${CHAT_MESSAGE_BUBBLE_MAX_WIDTH};
  overflow: hidden;
  padding: 0;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -1px;
  }
`;

const StyledImage = styled.img`
  display: block;
  max-height: ${CHAT_MESSAGE_MEDIA_MAX_HEIGHT};
  max-width: 100%;
  object-fit: contain;
`;

const StyledVideo = styled.video`
  border-radius: ${themeCssVariables.border.radius.md};
  display: block;
  max-height: ${CHAT_MESSAGE_MEDIA_MAX_HEIGHT};
  max-width: ${CHAT_MESSAGE_BUBBLE_MAX_WIDTH};
`;

type ChatMessageAttachmentProps = {
  file: FieldFilesValue;
};

export const ChatMessageAttachment = ({ file }: ChatMessageAttachmentProps) => {
  const { openFilePreview } = useOpenFilePreview();
  const [failedMediaUrl, setFailedMediaUrl] = useState<string | undefined>();

  const hasMediaFailedToLoad =
    isDefined(failedMediaUrl) && failedMediaUrl === file.url;

  const handleMediaError = () => setFailedMediaUrl(file.url);

  if (!isNonEmptyString(file.url) || file.isDeleted || hasMediaFailedToLoad) {
    return <FileChip file={file} onClick={openFilePreview} />;
  }

  switch (getFieldFilesValueCategory(file)) {
    case FILE_CATEGORIES.IMAGE:
      return (
        <StyledImageButton type="button" onClick={() => openFilePreview(file)}>
          <StyledImage
            src={file.url}
            alt={file.label}
            loading="lazy"
            onError={handleMediaError}
          />
        </StyledImageButton>
      );
    case FILE_CATEGORIES.VIDEO:
      return (
        <StyledVideo
          src={file.url}
          aria-label={file.label}
          controls
          preload="metadata"
          onError={handleMediaError}
        />
      );
    case FILE_CATEGORIES.AUDIO:
      return (
        <ChatMessageVoiceNote
          src={file.url}
          label={file.label}
          onError={handleMediaError}
        />
      );
    default:
      return <FileChip file={file} onClick={openFilePreview} />;
  }
};
