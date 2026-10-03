import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildAgentChatThreadListFilter } from '@/ai/utils/buildAgentChatThreadListFilter';

const INCLUDE_DELETED_FILTER = {
  or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
};

const buildChatObject = (fieldNames: string[]) =>
  ({
    fields: fieldNames.map((name) => ({ name })),
  }) as Pick<EnrichedObjectMetadataItem, 'fields'>;

describe('buildAgentChatThreadListFilter', () => {
  it('lists deleted chats so they can be restored', () => {
    expect(
      buildAgentChatThreadListFilter(buildChatObject(['title']), 'member-id'),
    ).toEqual(INCLUDE_DELETED_FILTER);
  });

  it('lists only the workflow run conversations routed to the member', () => {
    expect(
      buildAgentChatThreadListFilter(
        buildChatObject(['title', 'workflowRun']),
        'member-id',
      ),
    ).toEqual({
      and: [
        {
          or: [
            { workflowRunId: { is: 'NULL' } },
            { workspaceMemberId: { eq: 'member-id' } },
          ],
        },
        INCLUDE_DELETED_FILTER,
      ],
    });
  });

  it('leaves workflow run conversations out without a current member', () => {
    expect(
      buildAgentChatThreadListFilter(
        buildChatObject(['title', 'workflowRun']),
        undefined,
      ),
    ).toEqual({
      and: [
        { or: [{ workflowRunId: { is: 'NULL' } }] },
        INCLUDE_DELETED_FILTER,
      ],
    });
  });
});
