import { isDefined } from 'twenty-shared/utils';

import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';
import {
  type InboxItemToolCall,
  InboxItemToolCallStatus,
} from '~/generated/graphql';

// The call that takes the body of the pane: the first one still to do, or
// failed and waiting to be fixed, whose tool knows how to draw itself in
// full. Everything else in the plan is a row beneath it.
export const getFeaturedInboxToolCall = (
  toolCalls: InboxItemToolCall[],
): InboxItemToolCall | null =>
  toolCalls.find(
    (toolCall) =>
      (toolCall.status === InboxItemToolCallStatus.PROPOSED ||
        toolCall.status === InboxItemToolCallStatus.FAILED) &&
      isDefined(getInboxToolCallRenderer(toolCall.toolName)?.Surface),
  ) ?? null;
