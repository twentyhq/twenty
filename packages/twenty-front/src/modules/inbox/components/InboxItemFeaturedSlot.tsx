import { isDefined } from 'twenty-shared/utils';

import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';
import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';

// The one place a tool's full surface is mounted. Which call gets it is the
// plan's decision, so a thread item and a record item reach the same composer
// by the same path.
export const InboxItemFeaturedSlot = () => {
  const { inboxItem, featuredToolCall, saveToolCallInput, registerFlush } =
    useInboxItemPlanContext();

  if (!isDefined(featuredToolCall)) {
    return null;
  }

  const Surface = getInboxToolCallRenderer(featuredToolCall.toolName)?.Surface;

  if (!isDefined(Surface)) {
    return null;
  }

  return (
    <Surface
      // Remounted per call and per state so the draft is the row shown.
      key={`${featuredToolCall.id}-${featuredToolCall.status}`}
      toolCall={featuredToolCall}
      inboxItem={inboxItem}
      onSave={(editedInput) =>
        saveToolCallInput(featuredToolCall.id, editedInput)
      }
      onRegisterFlush={(flush) => registerFlush(featuredToolCall.id, flush)}
    />
  );
};
