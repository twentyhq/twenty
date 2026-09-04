import { type WebClient } from '@slack/web-api';
import { describe, expect, it, vi } from 'vitest';

import { type SlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';
import { collectSlackRosterMembers } from 'src/logic-functions/utils/collect-slack-roster-members';

const buildSlackClient = (
  pages: { members: SlackRosterMember[]; nextCursor?: string }[],
) => {
  const usersListMock = vi.fn();

  for (const page of pages) {
    usersListMock.mockResolvedValueOnce({
      members: page.members,
      response_metadata: { next_cursor: page.nextCursor },
    });
  }

  return {
    slackClient: { users: { list: usersListMock } } as unknown as WebClient,
    usersListMock,
  };
};

describe('collectSlackRosterMembers', () => {
  it('should collect only linkable members', async () => {
    const { slackClient } = buildSlackClient([
      {
        members: [
          { id: 'U1' },
          { id: 'U-bot', is_bot: true },
          { id: 'USLACKBOT' },
          { id: 'U2' },
        ],
      },
    ]);

    const { members, isTruncated } = await collectSlackRosterMembers({
      slackClient,
    });

    expect(members.map((member) => member.id)).toEqual(['U1', 'U2']);
    expect(isTruncated).toBe(false);
  });

  it('should keep only the members the caller asks for', async () => {
    const { slackClient } = buildSlackClient([
      { members: [{ id: 'U1' }, { id: 'U2' }, { id: 'U3' }] },
    ]);

    const { members } = await collectSlackRosterMembers({
      slackClient,
      shouldCollectMember: (member) => member.id !== 'U2',
    });

    expect(members.map((member) => member.id)).toEqual(['U1', 'U3']);
  });

  it('should keep a member Slack repeats across pages only once', async () => {
    const { slackClient } = buildSlackClient([
      { members: [{ id: 'U1' }, { id: 'U2' }], nextCursor: 'cursor-2' },
      { members: [{ id: 'U2' }, { id: 'U3' }] },
    ]);

    const { members } = await collectSlackRosterMembers({ slackClient });

    expect(members.map((member) => member.id)).toEqual(['U1', 'U2', 'U3']);
  });

  it('should follow pagination cursors', async () => {
    const { slackClient, usersListMock } = buildSlackClient([
      { members: [{ id: 'U1' }], nextCursor: 'cursor-2' },
      { members: [{ id: 'U2' }] },
    ]);

    const { members, isTruncated } = await collectSlackRosterMembers({
      slackClient,
    });

    expect(members.map((member) => member.id)).toEqual(['U1', 'U2']);
    expect(isTruncated).toBe(false);
    expect(usersListMock).toHaveBeenNthCalledWith(2, {
      limit: 200,
      cursor: 'cursor-2',
    });
  });

  it('should stop paging and report truncation once the member cap is reached', async () => {
    const { slackClient, usersListMock } = buildSlackClient([
      { members: [{ id: 'U1' }, { id: 'U2' }], nextCursor: 'cursor-2' },
    ]);

    const { members, isTruncated } = await collectSlackRosterMembers({
      slackClient,
      maxMembers: 1,
    });

    expect(members.map((member) => member.id)).toEqual(['U1']);
    expect(isTruncated).toBe(true);
    expect(usersListMock).toHaveBeenCalledTimes(1);
  });

  it('should report truncation when the page cap is reached', async () => {
    const { slackClient, usersListMock } = buildSlackClient(
      Array.from({ length: 6 }, (_, index) => ({
        members: [{ id: `U${index}` }],
        nextCursor: `cursor-${index + 1}`,
      })),
    );

    const { isTruncated } = await collectSlackRosterMembers({ slackClient });

    expect(isTruncated).toBe(true);
    expect(usersListMock).toHaveBeenCalledTimes(5);
  });

  it('should honor a lower page cap', async () => {
    const { slackClient, usersListMock } = buildSlackClient(
      Array.from({ length: 4 }, (_, index) => ({
        members: [{ id: `U${index}` }],
        nextCursor: `cursor-${index + 1}`,
      })),
    );

    const { isTruncated } = await collectSlackRosterMembers({
      slackClient,
      maxPages: 2,
    });

    expect(isTruncated).toBe(true);
    expect(usersListMock).toHaveBeenCalledTimes(2);
  });
});
