import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { isAgentChatQueuedMessageRemovable } from '@/ai/utils/isAgentChatQueuedMessageRemovable';

const CURRENT_WORKSPACE_MEMBER_ID = 'current-workspace-member';
const OWN_MESSAGE = {
  role: 'user',
  metadata: { senderWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID },
} satisfies Pick<ExtendedUIMessage, 'role' | 'metadata'>;
const OTHER_MEMBER_MESSAGE = {
  role: 'user',
  metadata: { senderWorkspaceMemberId: 'other-workspace-member' },
} satisfies Pick<ExtendedUIMessage, 'role' | 'metadata'>;
const SENDERLESS_MESSAGE = {
  role: 'user',
} satisfies Pick<ExtendedUIMessage, 'role' | 'metadata'>;

type QueuedMessageRemovalTestCase = Parameters<
  typeof isAgentChatQueuedMessageRemovable
>[0] & {
  description: string;
  expected: boolean;
};

const TEST_CASES: QueuedMessageRemovalTestCase[] = [
  {
    description: 'allows an inbox writer to remove their own queued message',
    message: OWN_MESSAGE,
    currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
    isAiChatInboxEnabled: true,
    isReadOnly: false,
    expected: true,
  },
  {
    description:
      'prevents an inbox writer from removing another member message',
    message: OTHER_MEMBER_MESSAGE,
    currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
    isAiChatInboxEnabled: true,
    isReadOnly: false,
    expected: false,
  },
  {
    description: 'keeps senderless inbox messages non-removable',
    message: SENDERLESS_MESSAGE,
    currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
    isAiChatInboxEnabled: true,
    isReadOnly: false,
    expected: false,
  },
  {
    description:
      'requires a known current member before allowing inbox removal',
    message: OWN_MESSAGE,
    currentWorkspaceMemberId: undefined,
    isAiChatInboxEnabled: true,
    isReadOnly: false,
    expected: false,
  },
  {
    description: 'preserves legacy writer removal for another member message',
    message: OTHER_MEMBER_MESSAGE,
    currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
    isAiChatInboxEnabled: false,
    isReadOnly: false,
    expected: true,
  },
  {
    description: 'preserves legacy writer removal without sender metadata',
    message: SENDERLESS_MESSAGE,
    currentWorkspaceMemberId: undefined,
    isAiChatInboxEnabled: false,
    isReadOnly: false,
    expected: true,
  },
  {
    description:
      'prevents a read-only inbox member from removing their own message',
    message: OWN_MESSAGE,
    currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
    isAiChatInboxEnabled: true,
    isReadOnly: true,
    expected: false,
  },
  {
    description: 'prevents read-only removal when the inbox is disabled',
    message: SENDERLESS_MESSAGE,
    currentWorkspaceMemberId: undefined,
    isAiChatInboxEnabled: false,
    isReadOnly: true,
    expected: false,
  },
];

describe('isAgentChatQueuedMessageRemovable', () => {
  it.each(TEST_CASES)(
    '$description',
    ({
      message,
      currentWorkspaceMemberId,
      isAiChatInboxEnabled,
      isReadOnly,
      expected,
    }) => {
      expect(
        isAgentChatQueuedMessageRemovable({
          message,
          currentWorkspaceMemberId,
          isAiChatInboxEnabled,
          isReadOnly,
        }),
      ).toBe(expected);
    },
  );
});
