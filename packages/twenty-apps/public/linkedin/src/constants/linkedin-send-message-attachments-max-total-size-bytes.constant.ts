import { LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/linkedin-attachment-max-size-bytes.constant';

// Unipile takes every file of a reply in one request, so they are all held in memory at once
export const LINKEDIN_SEND_MESSAGE_ATTACHMENTS_MAX_TOTAL_SIZE_BYTES =
  LINKEDIN_ATTACHMENT_MAX_SIZE_BYTES;
