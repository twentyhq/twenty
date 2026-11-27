import { isDefined } from 'twenty-sdk/utils';

type LinkRecord = {
  id: string;
  name?: string;
  telegramUserId?: string;
  telegramUsername?: string;
  workspaceMemberId?: string | null;
};

type RequestRecord = {
  id: string;
  status: string;
  updatedAt: string;
  name?: string;
  telegramChatId?: string;
  telegramMessageId?: string;
  telegramUserId?: string;
  workspaceMemberId?: string;
  requestText?: { markdown: string | null };
  responseText?: { markdown: string | null };
  errorMessage?: string;
  feedback?: string;
};

type EqualityFilter = Record<string, { eq: string }>;

type RequestFilter = {
  telegramChatId?: { eq: string };
  telegramMessageId?: { eq: string };
  workspaceMemberId?: { eq: string };
  status?: { in: string[] };
};

type RequestClaimFilter = {
  and: [
    { id: { eq: string } },
    {
      or: [
        { status: { eq: string } },
        { status: { eq: string }; updatedAt: { lt: string } },
      ];
    },
  ];
};

const REQUEST_FILTER_FIELDS = ['id', 'status', 'telegramUserId'] as const;

type RequestFieldsFilter = Partial<
  Record<(typeof REQUEST_FILTER_FIELDS)[number], { eq: string }>
>;

const LINK_FILTER_FIELDS: (keyof LinkRecord)[] = [
  'id',
  'telegramUserId',
  'workspaceMemberId',
];

type FakeQuery = {
  telegramAssistantRequests?: {
    __args: { filter: RequestFilter; first: number };
  };
  telegramUserLinks?: { __args: { filter: EqualityFilter } };
  workspaceMembers?: { __args: { filter?: EqualityFilter } };
};

type FakeMutation = {
  createTelegramUserLink?: { __args: { data: Omit<LinkRecord, 'id'> } };
  updateTelegramUserLink?: {
    __args: { id: string; data: Omit<LinkRecord, 'id'> };
  };
  destroyTelegramUserLink?: { __args: { id: string } };
  createTelegramAssistantRequest?: {
    __args: { data: Omit<RequestRecord, 'id' | 'status' | 'updatedAt'> };
  };
  updateTelegramAssistantRequests?: {
    __args: {
      data: Partial<RequestRecord>;
      filter: RequestClaimFilter | RequestFieldsFilter;
    };
  };
  updateTelegramAssistantRequest?: {
    __args: { id: string; data: Partial<RequestRecord> };
  };
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
  const requests: RequestRecord[] = [];
  const state = { links: [...links], createdCount: 0, requests };

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

        if (isDefined(query.telegramAssistantRequests)) {
          const { filter, first } = query.telegramAssistantRequests.__args;

          return {
            telegramAssistantRequests: toConnection(
              state.requests
                .filter(
                  (request) =>
                    (!isDefined(filter.telegramChatId) ||
                      request.telegramChatId === filter.telegramChatId.eq) &&
                    (!isDefined(filter.telegramMessageId) ||
                      request.telegramMessageId ===
                        filter.telegramMessageId.eq) &&
                    (!isDefined(filter.workspaceMemberId) ||
                      request.workspaceMemberId ===
                        filter.workspaceMemberId.eq) &&
                    (!isDefined(filter.status) ||
                      filter.status.in.includes(request.status)),
                )
                .reverse()
                .slice(0, first),
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

        if (isDefined(mutation.createTelegramAssistantRequest)) {
          const { data } = mutation.createTelegramAssistantRequest.__args;

          if (
            state.requests.some(
              (request) =>
                request.telegramChatId === data.telegramChatId &&
                request.telegramMessageId === data.telegramMessageId,
            )
          ) {
            throw new Error('duplicate key value violates unique constraint');
          }

          const id = `request-${state.requests.length + 1}`;

          state.requests.push({
            id,
            status: 'PENDING',
            updatedAt: new Date().toISOString(),
            ...data,
          });

          return { createTelegramAssistantRequest: { id } };
        }

        if (isDefined(mutation.updateTelegramAssistantRequests)) {
          const { data, filter } =
            mutation.updateTelegramAssistantRequests.__args;
          const claimed = state.requests.filter((request) => {
            if (!('and' in filter)) {
              return REQUEST_FILTER_FIELDS.every(
                (field) =>
                  !isDefined(filter[field]) ||
                  request[field] === filter[field].eq,
              );
            }

            const [{ id }, { or }] = filter.and;

            return (
              request.id === id.eq &&
              (request.status === 'PENDING' ||
                (request.status === 'PROCESSING' &&
                  request.updatedAt < or[1].updatedAt.lt))
            );
          });

          for (const request of claimed) {
            Object.assign(request, data, {
              updatedAt: new Date().toISOString(),
            });
          }

          return {
            updateTelegramAssistantRequests: claimed.map(({ id }) => ({ id })),
          };
        }

        if (isDefined(mutation.updateTelegramAssistantRequest)) {
          const { id, data } = mutation.updateTelegramAssistantRequest.__args;
          const request = state.requests.find(
            (candidate) => candidate.id === id,
          );

          if (isDefined(request)) {
            Object.assign(request, data, {
              updatedAt: new Date().toISOString(),
            });
          }
        }

        return {};
      },
    },
  };
};
