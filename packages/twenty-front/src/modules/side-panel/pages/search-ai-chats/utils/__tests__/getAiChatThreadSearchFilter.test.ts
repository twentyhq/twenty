import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { getAiChatThreadSearchFilter } from '@/side-panel/pages/search-ai-chats/utils/getAiChatThreadSearchFilter';

const workspaceMembers = [
  {
    id: 'alice',
    name: { firstName: 'Alice', lastName: 'Smith' },
    userEmail: 'alice@example.com',
  },
  {
    id: 'bob',
    name: { firstName: 'Robert', lastName: 'Jones' },
    userEmail: 'bob@example.com',
  },
];

describe('getAiChatThreadSearchFilter', () => {
  it('finds renamed peers through canonical pair IDs without searching DM titles', () => {
    expect(
      getAiChatThreadSearchFilter({
        searchTerm: 'Robert',
        workspaceMembers,
        currentWorkspaceMemberId: 'alice',
        isDirectMessageEnabled: true,
      }),
    ).toMatchObject({
      or: [
        {
          and: [
            {
              not: {
                conversationType: {
                  eq: AgentChatThreadConversationType.DIRECT_MESSAGE,
                },
              },
            },
            { title: { ilike: '%Robert%' } },
          ],
        },
        {
          and: [
            {
              conversationType: {
                eq: AgentChatThreadConversationType.DIRECT_MESSAGE,
              },
            },
            {
              or: [
                { directMessageFirstWorkspaceMemberId: { in: ['bob'] } },
                { directMessageSecondWorkspaceMemberId: { in: ['bob'] } },
              ],
            },
          ],
        },
      ],
    });
  });

  it('escapes wildcard characters in ordinary title searches', () => {
    expect(
      getAiChatThreadSearchFilter({
        searchTerm: '100%_complete',
        workspaceMembers,
        currentWorkspaceMemberId: 'alice',
        isDirectMessageEnabled: true,
      }),
    ).toMatchObject({
      and: [
        {
          not: {
            conversationType: {
              eq: AgentChatThreadConversationType.DIRECT_MESSAGE,
            },
          },
        },
        { title: { ilike: '%100\\%\\_complete%' } },
      ],
    });
  });

  it('does not match every direct message by the current member name', () => {
    expect(
      getAiChatThreadSearchFilter({
        searchTerm: 'Alice',
        workspaceMembers,
        currentWorkspaceMemberId: 'alice',
        isDirectMessageEnabled: true,
      }),
    ).toMatchObject({
      and: [
        {
          not: {
            conversationType: {
              eq: AgentChatThreadConversationType.DIRECT_MESSAGE,
            },
          },
        },
        { title: { ilike: '%Alice%' } },
      ],
    });
  });

  it('keeps member-name searches on existing fields until direct-message identity is enabled', () => {
    expect(
      getAiChatThreadSearchFilter({
        searchTerm: 'Robert',
        workspaceMembers,
        currentWorkspaceMemberId: 'alice',
        isDirectMessageEnabled: false,
      }),
    ).toEqual({ title: { ilike: '%Robert%' } });
  });
});
