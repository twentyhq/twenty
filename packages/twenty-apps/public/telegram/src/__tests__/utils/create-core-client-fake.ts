import { isDefined } from 'twenty-sdk/utils';

type LinkRecord = {
  id: string;
  name?: string;
  telegramUserId?: string;
  telegramUsername?: string;
  workspaceMemberId?: string | null;
};

type EqualityFilter = Record<string, { eq: string }>;

const LINK_FILTER_FIELDS: (keyof LinkRecord)[] = [
  'id',
  'telegramUserId',
  'workspaceMemberId',
];

type FakeQuery = {
  telegramUserLinks?: { __args: { filter: EqualityFilter } };
  workspaceMembers?: { __args: { filter?: EqualityFilter } };
};

type FakeMutation = {
  createTelegramUserLink?: { __args: { data: Omit<LinkRecord, 'id'> } };
  updateTelegramUserLink?: {
    __args: { id: string; data: Omit<LinkRecord, 'id'> };
  };
  destroyTelegramUserLink?: { __args: { id: string } };
};

const toConnection = <TNode>(nodes: TNode[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

export const createCoreClientFake = ({
  links = [],
  workspaceMemberIds = [],
}: {
  links?: LinkRecord[];
  workspaceMemberIds?: string[];
} = {}) => {
  const state = { links: [...links], createdCount: 0 };

  return {
    state,
    client: {
      query: async (query: FakeQuery) => {
        if (isDefined(query.workspaceMembers)) {
          const id = query.workspaceMembers.__args.filter?.id;

          return {
            workspaceMembers: toConnection(
              workspaceMemberIds
                .filter((memberId) => !isDefined(id) || memberId === id.eq)
                .map((memberId) => ({ id: memberId })),
            ),
          };
        }

        const filter = query.telegramUserLinks?.__args.filter ?? {};

        return {
          telegramUserLinks: toConnection(
            state.links.filter((link) =>
              LINK_FILTER_FIELDS.every(
                (field) =>
                  !isDefined(filter[field]) || link[field] === filter[field].eq,
              ),
            ),
          ),
        };
      },
      mutation: async (mutation: FakeMutation) => {
        if (isDefined(mutation.createTelegramUserLink)) {
          const { data } = mutation.createTelegramUserLink.__args;

          if (
            state.links.some(
              (link) => link.telegramUserId === data.telegramUserId,
            )
          ) {
            throw new Error('duplicate key value violates unique constraint');
          }

          state.createdCount += 1;
          state.links.push({ id: `link-${state.createdCount}`, ...data });
        }

        if (isDefined(mutation.updateTelegramUserLink)) {
          const { id, data } = mutation.updateTelegramUserLink.__args;

          state.links = state.links.map((link) =>
            link.id === id ? { ...link, ...data } : link,
          );
        }

        if (isDefined(mutation.destroyTelegramUserLink)) {
          const { id } = mutation.destroyTelegramUserLink.__args;

          state.links = state.links.filter((link) => link.id !== id);
        }

        return {};
      },
    },
  };
};
