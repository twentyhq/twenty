import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';

import { CHAT_MESSAGE_BUBBLE_MAX_WIDTH } from '@/activities/emails/constants/ChatMessageBubbleMaxWidth';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { FILE_CATEGORIES } from 'twenty-shared/types';
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

const StyledAudio = styled.audio`
  display: block;
  max-width: ${CHAT_MESSAGE_BUBBLE_MAX_WIDTH};
`;

type ChatThreadMessageAttachmentProps = {
  file: FieldFilesValue;
};

export const ChatThreadMessageAttachment = ({
  file,
}: ChatThreadMessageAttachmentProps) => {
  const setFilePreview = useSetAtomState(filePreviewState);
  const isAttachmentPreviewEnabled = useAtomStateValue(
    isAttachmentPreviewEnabledState,
  );

  const handlePreview = (fileToPreview: FieldFilesValue) => {
    if (isAttachmentPreviewEnabled) {
      setFilePreview(fileToPreview);

      return;
    }

    if (isNonEmptyString(fileToPreview.url)) {
      downloadFile(fileToPreview.url, fileToPreview.label);
    }
  };

  if (!isNonEmptyString(file.url) || file.isDeleted === true) {
    return <FileChip file={file} onClick={handlePreview} />;
  }

  switch (getFieldFilesValueCategory(file)) {
    case FILE_CATEGORIES.IMAGE:
      return (
        <StyledImageButton type="button" onClick={() => handlePreview(file)}>
          <StyledImage src={file.url} alt={file.label} loading="lazy" />
        </StyledImageButton>
      );
    case FILE_CATEGORIES.VIDEO:
      return (
        <StyledVideo
          src={file.url}
          aria-label={file.label}
          controls
          preload="metadata"
        />
      );
    case FILE_CATEGORIES.AUDIO:
      return (
        <StyledAudio
          src={file.url}
          aria-label={file.label}
          controls
          preload="metadata"
        />
      );
    default:
      return <FileChip file={file} onClick={handlePreview} />;
  }
};
