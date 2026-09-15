import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { type InboxSection } from '@/inbox/constants/InboxSections';

export const getInboxSectionPath = (inboxSection: InboxSection): string =>
  getAppPath(AppPath.InboxSectionPage, { inboxSectionSlug: inboxSection.slug });
