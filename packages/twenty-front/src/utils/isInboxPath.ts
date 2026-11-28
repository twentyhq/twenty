import { isDefined } from 'twenty-shared/utils';

import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';
import { matchInboxPath } from '@/ai-chat/utils/matchInboxPath';

export const isInboxPath = (
  pathname: string,
  inboxRecordRouteObjectNames: InboxRecordRouteObjectNames | null,
) => isDefined(matchInboxPath({ pathname, inboxRecordRouteObjectNames }));
