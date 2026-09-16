import { InboxPlanToolCallEditor } from '@/inbox/components/InboxPlanToolCallEditor';
import { InboxEmailComposer } from '@/inbox/tool-call-renderers/email/components/InboxEmailComposer';
import { getEmailComposerPrefillFromToolCall } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';
import { type InboxToolCallEditorProps } from '@/inbox/tool-call-renderers/types/InboxToolCallRenderer';
import { InboxItemToolCallStatus } from '~/generated/graphql';

type InboxEmailToolCallEditorProps = InboxToolCallEditorProps;

// An email proposal on an item that is not about a thread: the composer where
// the schema form used to be. Once the call has run there is nothing left to
// compose, and the read-only form says what was sent.
export const InboxEmailToolCallEditor = ({
  toolCall,
  source,
  onSave,
  onRegisterFlush,
}: InboxEmailToolCallEditorProps) => {
  const isEditable = toolCall.status === InboxItemToolCallStatus.PROPOSED;

  if (!isEditable) {
    return (
      <InboxPlanToolCallEditor
        toolCall={toolCall}
        source={source}
        onSave={onSave}
      />
    );
  }

  return (
    <InboxEmailComposer
      prefill={getEmailComposerPrefillFromToolCall(toolCall)}
      onSave={onSave}
      onHandleChange={(handle) =>
        onRegisterFlush?.(handle ? handle.flushSave : null)
      }
    />
  );
};
