import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { isAgentChatMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';

const CURRENT_WORKSPACE_MEMBER_ID = 'current-workspace-member';
const OTHER_WORKSPACE_MEMBER_ID = 'other-workspace-member';

type MessageOwnershipTestCase = {
  name: string;
  role: ExtendedUIMessage['role'];
  senderWorkspaceMemberId?: string | null;
  isSenderlessUserMessageOwn: boolean;
  expected: boolean;
};

const TEST_CASES: MessageOwnershipTestCase[] = [
  {
    name: 'retains ownership of legacy user messages when the fallback is enabled',
    role: 'user',
    isSenderlessUserMessageOwn: true,
    expected: true,
  },
  {
    name: 'keeps unknown inbox senders distinct from the current member',
    role: 'user',
    senderWorkspaceMemberId: null,
    isSenderlessUserMessageOwn: false,
    expected: false,
  },
  {
    name: 'does not assign unidentified assistant messages to the current member',
    role: 'assistant',
    isSenderlessUserMessageOwn: true,
    expected: false,
  },
  {
    name: 'does not override another member with the legacy fallback',
    role: 'user',
    senderWorkspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
    isSenderlessUserMessageOwn: true,
    expected: false,
  },
  {
    name: 'recognizes a known current-member sender in the inbox',
    role: 'user',
    senderWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
    isSenderlessUserMessageOwn: false,
    expected: true,
  },
  {
    name: 'preserves known authorship on assistant-role messages',
    role: 'assistant',
    senderWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
    isSenderlessUserMessageOwn: false,
    expected: true,
  },
];

describe('isAgentChatMessageOwn', () => {
  it.each(TEST_CASES)(
    '$name',
    ({
      role,
      senderWorkspaceMemberId,
      isSenderlessUserMessageOwn,
      expected,
    }) => {
      expect(
        isAgentChatMessageOwn({
          message: { role, metadata: { senderWorkspaceMemberId } },
          currentWorkspaceMemberId: CURRENT_WORKSPACE_MEMBER_ID,
          isSenderlessUserMessageOwn,
        }),
      ).toBe(expected);
    },
  );
});
