import { INBOX_SUBJECT_PREVIEWS } from '@/inbox/subject-previews/constants/InboxSubjectPreviews';
import { type InboxSubjectPreview } from '@/inbox/subject-previews/types/InboxSubjectPreview';

export const getInboxSubjectPreview = (
  objectNameSingular: string,
): InboxSubjectPreview | undefined =>
  INBOX_SUBJECT_PREVIEWS[objectNameSingular];
