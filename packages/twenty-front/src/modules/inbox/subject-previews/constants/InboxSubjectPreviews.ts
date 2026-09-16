import { CoreObjectNameSingular } from 'twenty-shared/types';

import { InboxMessageThreadPreview } from '@/inbox/subject-previews/message-thread/components/InboxMessageThreadPreview';
import { type InboxSubjectPreview } from '@/inbox/subject-previews/types/InboxSubjectPreview';

// Keyed by the object's singular name, which is how the item's subject
// resolves through object metadata. An object with no entry gets the default
// card: summary, one chip and the record graph.
export const INBOX_SUBJECT_PREVIEWS: Record<string, InboxSubjectPreview> = {
  [CoreObjectNameSingular.MessageThread]: {
    Preview: InboxMessageThreadPreview,
  },
};
