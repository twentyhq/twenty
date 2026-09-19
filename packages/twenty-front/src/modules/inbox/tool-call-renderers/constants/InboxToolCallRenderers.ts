import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconArrowBackUp, IconSend } from 'twenty-ui/icon';

import { InboxEmailToolCallEditor } from '@/inbox/tool-call-renderers/email/components/InboxEmailToolCallEditor';
import { InboxEmailToolCallSurface } from '@/inbox/tool-call-renderers/email/components/InboxEmailToolCallSurface';
import { SEND_EMAIL_TOOL_NAME } from '@/inbox/tool-call-renderers/email/constants/SendEmailToolName';
import { useInboxEmailReplyProposal } from '@/inbox/tool-call-renderers/email/hooks/useInboxEmailReplyProposal';
import { type InboxToolCallRenderer } from '@/inbox/tool-call-renderers/types/InboxToolCallRenderer';

// Keyed by tool name, which is what a producer writes on the row. A standard
// renderer is first-party React; the same slot is where an app-provided front
// component will hang once tools can declare one.
export const INBOX_TOOL_CALL_RENDERERS: Record<string, InboxToolCallRenderer> =
  {
    [SEND_EMAIL_TOOL_NAME]: {
      Editor: InboxEmailToolCallEditor,
      Surface: InboxEmailToolCallSurface,
      starter: {
        startsFrom: [CoreObjectNameSingular.MessageThread],
        label: () => t`Reply...`,
        Icon: IconArrowBackUp,
        useProposal: useInboxEmailReplyProposal,
      },
      runLabel: () => t`Send`,
      RunIcon: IconSend,
    },
  };
