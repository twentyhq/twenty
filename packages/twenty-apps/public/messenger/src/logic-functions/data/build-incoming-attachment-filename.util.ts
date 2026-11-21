const ATTACHMENT_FILENAME_MAX_LENGTH = 255;

export const buildIncomingAttachmentFilename = ({
  url,
  attachmentType,
  messageId,
  index,
}: {
  url: string;
  attachmentType: string;
  messageId: string;
  index: number;
}): string => {
  const urlFilename = decodeURIComponent(
    new URL(url).pathname.split('/').pop() ?? '',
  );
  const filename =
    urlFilename.length > 0
      ? urlFilename
      : `${attachmentType}-${messageId}-${index}`;

  return filename.slice(-ATTACHMENT_FILENAME_MAX_LENGTH);
};
