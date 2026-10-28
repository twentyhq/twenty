import { describe, expect, it } from 'vitest';

import { formatInboxMention } from '@/sdk/inbox/mentions/format-inbox-mention';

const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000001';

describe('formatInboxMention', () => {
  it('writes the workspace member token the inbox renders as a mention', () => {
    expect(
      formatInboxMention({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        label: 'Jony Ive',
      }),
    ).toBe(`[[record:workspaceMember:${WORKSPACE_MEMBER_ID}:Jony Ive]]`);
  });

  it('refuses an empty label', () => {
    expect(() =>
      formatInboxMention({ workspaceMemberId: WORKSPACE_MEMBER_ID, label: '' }),
    ).toThrow(/needs a label/);
  });

  it('refuses a label made only of whitespace', () => {
    expect(() =>
      formatInboxMention({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        label: '   ',
      }),
    ).toThrow(/needs a label/);
  });
});
