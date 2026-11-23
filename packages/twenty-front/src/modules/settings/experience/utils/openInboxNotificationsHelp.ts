import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';

import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

export const openInboxNotificationsHelp = () =>
  openUrlInNewTab(
    getDocumentationUrl({
      path: DOCUMENTATION_PATHS.USER_GUIDE_AI_HOW_TOS_INBOX_NOTIFICATIONS,
    }),
  );
