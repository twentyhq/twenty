import { isDefined } from 'twenty-shared/utils';

import { INBOX_TOOL_CALL_RENDERERS } from '@/inbox/tool-call-renderers/constants/InboxToolCallRenderers';
import { type InboxToolCallStarter } from '@/inbox/tool-call-renderers/types/InboxToolCallRenderer';

export type InboxToolCallStarterEntry = {
  toolName: string;
  starter: InboxToolCallStarter;
};

// The tools a person can start by hand from a subject of this object.
export const getInboxToolCallStarters = (
  objectNameSingular: string,
): InboxToolCallStarterEntry[] =>
  Object.entries(INBOX_TOOL_CALL_RENDERERS).flatMap(([toolName, renderer]) =>
    isDefined(renderer.starter) &&
    renderer.starter.startsFrom.includes(objectNameSingular)
      ? [{ toolName, starter: renderer.starter }]
      : [],
  );
