import { describe, expect, it } from 'vitest';

import { extractMentionedWorkspaceMemberIds } from '@/sdk/inbox/mentions/extract-mentioned-workspace-member-ids';
import { formatInboxMention } from '@/sdk/inbox/mentions/format-inbox-mention';
import { formatInboxRecordReference } from '@/sdk/inbox/mentions/format-inbox-record-reference';
import { INBOX_ASSISTANT_MENTION } from '@/sdk/inbox/mentions/inbox-assistant-mention';

const JONY_ID = '20202020-0000-4000-8000-000000000001';
const TIM_ID = '20202020-0000-4000-8000-000000000002';

describe('extractMentionedWorkspaceMemberIds', () => {
  it('reads back each mentioned member once and ignores other references', () => {
    const jony = formatInboxMention({
      workspaceMemberId: JONY_ID,
      label: 'Jony',
    });
    const tim = formatInboxMention({ workspaceMemberId: TIM_ID, label: 'Tim' });
    const company = formatInboxRecordReference({
      objectNameSingular: 'company',
      recordId: '20202020-0000-4000-8000-000000000003',
      label: 'Acme',
    });

    expect(
      extractMentionedWorkspaceMemberIds(
        `${jony} and ${tim}, can you look at ${company} with ${INBOX_ASSISTANT_MENTION}? Thanks ${jony}`,
      ),
    ).toEqual([JONY_ID, TIM_ID]);
  });

  it('returns nothing for text without mentions', () => {
    expect(extractMentionedWorkspaceMemberIds('Thanks!')).toEqual([]);
  });
});
