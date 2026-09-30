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
    expect(buildAgentChatThreadListFilter(buildChatObject(['title']))).toEqual(
      INCLUDE_DELETED_FILTER,
    );
  });

  it('leaves workflow run conversations out once chats can name a run', () => {
    expect(
      buildAgentChatThreadListFilter(buildChatObject(['title', 'workflowRun'])),
    ).toEqual({
      and: [{ workflowRunId: { is: 'NULL' } }, INCLUDE_DELETED_FILTER],
    });
  });
});
