import { makeExecutableSchema } from '@graphql-tools/schema';
import { isString } from '@sniptt/guards';
import {
  graphql,
  type GraphQLResolveInfo,
  Kind,
  print,
  printSchema,
  validate,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { isPlainObject } from 'twenty-shared/utils';

import { type WorkspaceApiNamingBindings } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-bindings.type';
import { createWorkspaceApiNamingSchema } from 'src/engine/api/common/workspace-api-naming/utils/create-workspace-api-naming-schema.util';
import { normalizeWorkspaceApiGraphqlResolveInfo } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-resolve-info.util';
import { WorkspaceApiNamingException } from 'src/engine/api/common/workspace-api-naming/workspace-api-naming.exception';

jest.mock(
  'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-resolve-info.util',
  () => {
    const actual = jest.requireActual<
      typeof import('src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-resolve-info.util')
    >(
      'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-resolve-info.util',
    );

    return {
      normalizeWorkspaceApiGraphqlResolveInfo: jest.fn(
        actual.normalizeWorkspaceApiGraphqlResolveInfo,
      ),
    };
  },
);

const BINDINGS: WorkspaceApiNamingBindings = {
  canonicalTypeNameByApiTypeName: {
    Query: 'Query',
    Mutation: 'Mutation',
    InboxThread: 'AgentChatThread',
    InboxMessage: 'AgentMessage',
    InboxThreadFilterInput: 'AgentChatThreadFilterInput',
    InboxThreadCreateInput: 'AgentChatThreadCreateInput',
  },
  canonicalFieldNameByApiTypeNameAndApiFieldName: {
    Query: { inboxThreads: 'agentChatThreads' },
    Mutation: { createInboxThread: 'createAgentChatThread' },
    InboxThread: { headline: 'title' },
    InboxMessage: { content: 'body' },
    InboxThreadFilterInput: { headline: 'title' },
    InboxThreadCreateInput: { headline: 'title' },
  },
  resolverNameMap: {
    Query: {
      inboxThreads: {
        objectMetadataUniversalIdentifier: 'conversation',
        method: 'findMany',
        operationType: 'query',
      },
    },
    Mutation: {
      createInboxThread: {
        objectMetadataUniversalIdentifier: 'conversation',
        method: 'createOne',
        operationType: 'mutation',
      },
    },
  },
};

const CANONICAL_TYPE_DEFINITIONS = `
  scalar JSON
  type Person { name: String! }
  type AgentMessage { body: String! }
  type AgentChatThread {
    id: ID!
    title: String!
    payload: JSON
    person: Person
    messages(limit: Int): [AgentMessage!]!
  }
  input AgentChatThreadFilterInput {
    title: String
    payload: JSON
    and: [AgentChatThreadFilterInput!]
  }
  input AgentChatThreadCreateInput {
    title: String = "Untitled"
    payload: JSON
  }
  type Query {
    agentChatThreads(filter: AgentChatThreadFilterInput): [AgentChatThread!]!
  }
  type Mutation {
    createAgentChatThread(data: AgentChatThreadCreateInput!): AgentChatThread!
  }
`;

const API_TYPE_DEFINITIONS = `
  scalar JSON
  type Person { name: String! }
  type InboxMessage { content: String! }
  type InboxThread {
    id: ID!
    headline: String!
    payload: JSON
    person: Person
    messages(limit: Int): [InboxMessage!]!
  }
  input InboxThreadFilterInput {
    headline: String
    payload: JSON
    and: [InboxThreadFilterInput!]
  }
  input InboxThreadCreateInput {
    headline: String = "Untitled"
    payload: JSON
  }
  type Query {
    inboxThreads(filter: InboxThreadFilterInput): [InboxThread!]!
  }
  type Mutation {
    createInboxThread(data: InboxThreadCreateInput!): InboxThread!
  }
`;

const createSchemas = () => {
  const record = {
    id: 'thread',
    title: 'Canonical title',
    payload: { headline: 'Opaque JSON', nested: { content: 'Unchanged' } },
    person: { name: 'Ada' },
    messages: [{ body: 'Canonical message' }],
  };
  const rootResolver = jest.fn(
    (
      _source: unknown,
      _args: Record<string, unknown>,
      _context: unknown,
      _info: GraphQLResolveInfo,
    ) => [record],
  );
  const messagesResolver = jest.fn(
    (
      source: typeof record,
      _args: Record<string, unknown>,
      _context: unknown,
      _info: GraphQLResolveInfo,
    ) => source.messages,
  );
  const personNameResolver = jest.fn(
    (
      source: typeof record.person,
      _args: Record<string, unknown>,
      _context: unknown,
      _info: GraphQLResolveInfo,
    ) => source.name.toUpperCase(),
  );
  const mutationResolver = jest.fn(
    (
      _source: unknown,
      args: Record<string, unknown>,
      _context: unknown,
      _info: GraphQLResolveInfo,
    ) => {
      if (!isPlainObject(args.data) || !isString(args.data.title)) {
        throw new Error('Expected canonical create input');
      }

      return { ...record, title: args.data.title, payload: args.data.payload };
    },
  );
  const apiResolver = jest.fn(() => {
    throw new Error('Expected canonical resolver');
  });
  const canonicalSchema = makeExecutableSchema({
    typeDefs: CANONICAL_TYPE_DEFINITIONS,
    resolvers: {
      JSON: GraphQLJSON,
      Query: { agentChatThreads: rootResolver },
      Mutation: { createAgentChatThread: mutationResolver },
      AgentChatThread: { messages: messagesResolver },
      Person: { name: personNameResolver },
    },
  });
  const apiSchema = makeExecutableSchema({
    typeDefs: API_TYPE_DEFINITIONS,
    resolvers: {
      JSON: GraphQLJSON,
      Query: { inboxThreads: apiResolver },
      Mutation: { createInboxThread: apiResolver },
      InboxThread: { messages: apiResolver },
      Person: { name: apiResolver },
    },
  });

  return {
    apiSchema,
    canonicalSchema,
    apiResolver,
    rootResolver,
    messagesResolver,
    personNameResolver,
    mutationResolver,
  };
};

describe('createWorkspaceApiNamingSchema', () => {
  it('executes API fields through canonical resolvers while preserving aliases and response types', async () => {
    const {
      apiSchema,
      canonicalSchema,
      rootResolver,
      messagesResolver,
      personNameResolver,
      apiResolver,
    } = createSchemas();
    const originalApiSchema = printSchema(apiSchema);
    const originalApiResolver = apiSchema.getQueryType()?.getFields()
      .inboxThreads.resolve;
    const originalCanonicalSchema = printSchema(canonicalSchema);
    const schema = createWorkspaceApiNamingSchema({
      apiSchema,
      canonicalSchema,
      bindings: BINDINGS,
    });
    const variableValues = {
      where: {
        headline: 'Find',
        and: [{ headline: 'Again' }],
        payload: { headline: 'Opaque input' },
      },
      showPerson: true,
    };
    const originalVariableValues = structuredClone(variableValues);
    const rootValue = { request: 'root' };
    const contextValue = { actor: 'member' };

    const result = await graphql({
      schema,
      source: `
        query Inbox($where: InboxThreadFilterInput!, $showPerson: Boolean!, $take: Int = 2) {
          page: inboxThreads(filter: $where) {
            __typename
            id
            ...ThreadSummary
            messages(limit: $take) {
              ... on InboxMessage { snippet: content }
            }
            person @include(if: $showPerson) { name }
            skipped: person @skip(if: $showPerson) { name }
          }
        }
        fragment ThreadSummary on InboxThread { label: headline payload }
      `,
      variableValues,
      rootValue,
      contextValue,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      page: [
        {
          __typename: 'InboxThread',
          id: 'thread',
          label: 'Canonical title',
          payload: {
            headline: 'Opaque JSON',
            nested: { content: 'Unchanged' },
          },
          messages: [{ snippet: 'Canonical message' }],
          person: { name: 'ADA' },
        },
      ],
    });
    const [source, args, context, info] = rootResolver.mock.calls[0];
    expect(source).toBe(rootValue);
    expect(context).toBe(contextValue);
    expect(args).toEqual({
      filter: {
        title: 'Find',
        and: [{ title: 'Again' }],
        payload: { headline: 'Opaque input' },
      },
    });
    expect(info.schema).toBe(canonicalSchema);
    expect(info.parentType.name).toBe('Query');
    expect(info.fieldName).toBe('agentChatThreads');
    expect(info.returnType.toString()).toBe('[AgentChatThread!]!');
    expect(info.path.key).toBe('page');
    expect(info.rootValue).toBe(rootValue);
    expect(info.variableValues).toEqual({
      where: args.filter,
      showPerson: true,
      take: 2,
    });
    expect(info.fragments.ThreadSummary.typeCondition.name.value).toBe(
      'AgentChatThread',
    );
    expect(print(info.fragments.ThreadSummary)).toContain('label: title');
    expect(print(info.operation)).toContain(
      '$where: AgentChatThreadFilterInput!',
    );
    expect(
      validate(canonicalSchema, {
        kind: Kind.DOCUMENT,
        definitions: [info.operation, ...Object.values(info.fragments)],
      }),
    ).toEqual([]);
    const nestedInfo = messagesResolver.mock.calls[0][3];
    expect(messagesResolver.mock.calls[0][1]).toEqual({ limit: 2 });
    expect(nestedInfo.parentType.name).toBe('AgentChatThread');
    expect(nestedInfo.returnType.toString()).toBe('[AgentMessage!]!');
    expect(print(nestedInfo.fieldNodes[0])).toContain('snippet: body');
    expect(nestedInfo.path.key).toBe('messages');
    expect(nestedInfo.path.prev?.key).toBe(0);
    expect(personNameResolver).toHaveBeenCalledTimes(1);
    expect(personNameResolver.mock.calls[0][3].schema).toBe(canonicalSchema);
    expect(apiResolver).not.toHaveBeenCalled();
    expect(variableValues).toEqual(originalVariableValues);
    expect(printSchema(apiSchema)).toBe(originalApiSchema);
    expect(printSchema(canonicalSchema)).toBe(originalCanonicalSchema);
    expect(apiSchema.getQueryType()?.getFields().inboxThreads.resolve).toBe(
      originalApiResolver,
    );
  });

  it('normalizes mutation literals and coerced defaults while treating JSON as opaque', async () => {
    const { apiSchema, canonicalSchema, mutationResolver } = createSchemas();
    const schema = createWorkspaceApiNamingSchema({
      apiSchema,
      canonicalSchema,
      bindings: BINDINGS,
    });

    const result = await graphql({
      schema,
      source: `
        mutation Create {
          saved: createInboxThread(data: { payload: { headline: "Opaque", nested: { content: "Keep" } } }) {
            headline
            payload
          }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      saved: {
        headline: 'Untitled',
        payload: { headline: 'Opaque', nested: { content: 'Keep' } },
      },
    });
    expect(mutationResolver.mock.calls[0][1]).toEqual({
      data: {
        title: 'Untitled',
        payload: { headline: 'Opaque', nested: { content: 'Keep' } },
      },
    });
    const info = mutationResolver.mock.calls[0][3];
    expect(info.fieldName).toBe('createAgentChatThread');
    expect(info.parentType.name).toBe('Mutation');
    expect(print(info.fieldNodes[0])).toContain('saved: createAgentChatThread');
    expect(print(info.fieldNodes[0])).toContain('headline: "Opaque"');
    expect(print(info.fieldNodes[0])).toContain('title');
  });

  it('normalizes resolver info only for custom resolvers and source methods while preserving default getter behavior', async () => {
    const normalizeInfo = jest.mocked(normalizeWorkspaceApiGraphqlResolveInfo);

    normalizeInfo.mockClear();

    const method = jest.fn(function (
      this: { title: string },
      _args: Record<string, unknown>,
      _context: unknown,
      _info: GraphQLResolveInfo,
    ) {
      return this.title;
    });
    const methodGetter = jest.fn(() => method);
    const titleGetter = jest.fn(() => 'Getter');
    const record = {
      title: 'Plain',
      get getterTitle() {
        return titleGetter();
      },
      get methodTitle() {
        return methodGetter();
      },
    };
    const functionSource = Object.assign(() => undefined, {
      title: 'Function',
      getterTitle: 'Function getter',
      methodTitle: 'Function method',
    });
    const canonicalSchema = makeExecutableSchema({
      typeDefs: `
        type AgentChatThread {
          title: String!
          getterTitle: String!
          methodTitle(filter: AgentChatThreadFilterInput): String!
        }
        input AgentChatThreadFilterInput { title: String }
        type Query { agentChatThreads: [AgentChatThread!]! }
      `,
      resolvers: {
        Query: { agentChatThreads: () => [record, functionSource] },
      },
    });
    const apiSchema = makeExecutableSchema({
      typeDefs: `
        type InboxThread {
          headline: String!
          getterHeadline: String!
          methodHeadline(filter: InboxThreadFilterInput): String!
        }
        input InboxThreadFilterInput { headline: String }
        type Query { inboxThreads: [InboxThread!]! }
      `,
    });
    const schema = createWorkspaceApiNamingSchema({
      apiSchema,
      canonicalSchema,
      bindings: {
        ...BINDINGS,
        canonicalFieldNameByApiTypeNameAndApiFieldName: {
          ...BINDINGS.canonicalFieldNameByApiTypeNameAndApiFieldName,
          InboxThread: {
            headline: 'title',
            getterHeadline: 'getterTitle',
            methodHeadline: 'methodTitle',
          },
        },
      },
    });
    const contextValue = { actor: 'member' };
    const result = await graphql({
      schema,
      source: `
        { inboxThreads {
          headline
          getterHeadline
          methodHeadline(filter: { headline: "Filter" })
        } }
      `,
      contextValue,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      inboxThreads: [
        {
          headline: 'Plain',
          getterHeadline: 'Getter',
          methodHeadline: 'Plain',
        },
        {
          headline: 'Function',
          getterHeadline: 'Function getter',
          methodHeadline: 'Function method',
        },
      ],
    });
    expect(normalizeInfo).toHaveBeenCalledTimes(2);
    expect(titleGetter).toHaveBeenCalledTimes(1);
    expect(methodGetter).toHaveBeenCalledTimes(2);
    expect(method.mock.contexts[0]).toBe(record);
    const [args, context, info] = method.mock.calls[0];

    expect(args).toEqual({ filter: { title: 'Filter' } });
    expect(context).toBe(contextValue);
    expect(info.schema).toBe(canonicalSchema);
    expect(info.fieldName).toBe('methodTitle');
    expect(info.parentType.name).toBe('AgentChatThread');
  });

  it('rejects an explicit binding to an unavailable canonical field', () => {
    const { apiSchema, canonicalSchema } = createSchemas();

    expect(() =>
      createWorkspaceApiNamingSchema({
        apiSchema,
        canonicalSchema,
        bindings: {
          ...BINDINGS,
          canonicalFieldNameByApiTypeNameAndApiFieldName: {
            ...BINDINGS.canonicalFieldNameByApiTypeNameAndApiFieldName,
            Query: { inboxThreads: 'missing' },
          },
        },
      }),
    ).toThrow(WorkspaceApiNamingException);
  });

  it('rejects an API field absent from the canonical schema without an explicit binding', () => {
    expect(() =>
      createWorkspaceApiNamingSchema({
        apiSchema: makeExecutableSchema({
          typeDefs: 'type Query { present: String, missing: String }',
        }),
        canonicalSchema: makeExecutableSchema({
          typeDefs: 'type Query { present: String }',
        }),
        bindings: {
          canonicalTypeNameByApiTypeName: {},
          canonicalFieldNameByApiTypeNameAndApiFieldName: {},
          resolverNameMap: { Query: {}, Mutation: {} },
        },
      }),
    ).toThrow('Canonical field "Query.missing" is unavailable');
  });
});
