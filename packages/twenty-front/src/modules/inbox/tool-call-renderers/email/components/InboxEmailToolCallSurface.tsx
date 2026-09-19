import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InboxToolCallFailureNotice } from '@/inbox/components/InboxToolCallFailureNotice';
import { useInboxItemMessageThreadId } from '@/inbox/hooks/useInboxItemMessageThreadId';
import { InboxEmailComposer } from '@/inbox/tool-call-renderers/email/components/InboxEmailComposer';
import { useInboxEmailReplyDefaults } from '@/inbox/tool-call-renderers/email/hooks/useInboxEmailReplyDefaults';
import { getEmailComposerPrefillFromToolCall } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';
import { type InboxToolCallSurfaceProps } from '@/inbox/tool-call-renderers/types/InboxToolCallRenderer';
import { InboxItemToolCallStatus } from '~/generated/graphql';

type InboxEmailToolCallSurfaceProps = InboxToolCallSurfaceProps;

// The composer as the body of the pane. What the person types is the call's
// edited input and the footer runs the call, so a reply keeps the audit row
// and the permissions of every other plan step.
export const InboxEmailToolCallSurface = ({
  toolCall,
  inboxItem,
  onSave,
  onRegisterFlush,
}: InboxEmailToolCallSurfaceProps) => {
  const messageThreadId = useInboxItemMessageThreadId(inboxItem);
  const replyDefaults = useInboxEmailReplyDefaults({
    messageThreadId,
    queueId: inboxItem.queueId,
  });

  return (
    <>
      {toolCall.status === InboxItemToolCallStatus.FAILED && (
        <InboxToolCallFailureNotice error={toolCall.error} />
      )}
      <InboxEmailComposer
        prefill={getEmailComposerPrefillFromToolCall(toolCall)}
        replyDefaults={replyDefaults}
        contextRecord={
          isDefined(messageThreadId)
            ? {
                recordId: messageThreadId,
                objectNameSingular: CoreObjectNameSingular.MessageThread,
              }
            : undefined
        }
        onSave={onSave}
        ref={(handle) => onRegisterFlush?.(handle ? handle.flushSave : null)}
      />
    </>
  );
};
