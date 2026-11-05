import {
  coerceInputValue,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { normalizeWorkspaceApiInputValue } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-input-value.util';

describe('normalizeWorkspaceApiInputValue', () => {
  it('normalizes typed keys through nested lists and filters while preserving JSON and enums', () => {
    const memberInput = new GraphQLInputObjectType({
      name: 'ApiMemberFilterInput',
      fields: { display: { type: GraphQLString } },
    });
    const filterInput: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: 'ApiConversationFilterInput',
      fields: () => ({
        headline: { type: GraphQLString },
        owner: { type: memberInput },
        and: { type: new GraphQLList(filterInput) },
        payload: { type: GraphQLJSON },
      }),
    });
    const orderByInput = new GraphQLInputObjectType({
      name: 'ApiConversationOrderByInput',
      fields: {
        headline: {
          type: new GraphQLEnumType({
            name: 'Direction',
            values: { Desc: { value: 'desc' } },
          }),
        },
      },
    });
    const requestInput = new GraphQLInputObjectType({
      name: 'ApiRequestInput',
      fields: {
        criteria: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLList(filterInput)),
          ),
        },
        orderBy: { type: new GraphQLList(orderByInput) },
      },
    });
    const payload = {
      headline: 'Opaque title',
      owner: { display: 'Unchanged' },
    };
    const value = {
      criteria: [
        [
          {
            headline: 'Conversation',
            owner: { display: 'Ada' },
            and: [{ headline: 'Follow-up' }, null],
            payload,
          },
        ],
        null,
        [],
      ],
      orderBy: [{ headline: 'desc' }],
    };
    const originalValue = structuredClone(value);

    const normalized = normalizeWorkspaceApiInputValue({
      value,
      type: requestInput,
      canonicalFieldNameByApiTypeNameAndApiFieldName: {
        ApiRequestInput: { criteria: 'filter' },
        ApiConversationFilterInput: {
          headline: 'title',
          owner: 'workspaceMember',
        },
        ApiMemberFilterInput: { display: 'name' },
        ApiConversationOrderByInput: { headline: 'title' },
        JSON: { headline: 'rewritten' },
      },
    });

    expect(normalized).toEqual({
      filter: [
        [
          {
            title: 'Conversation',
            workspaceMember: { name: 'Ada' },
            and: [{ title: 'Follow-up' }, null],
            payload,
          },
        ],
        null,
        [],
      ],
      orderBy: [{ title: 'desc' }],
    });
    expect(value).toEqual(originalValue);
  });

  it('normalizes coerced default objects without adding values to omitted inputs', () => {
    const memberInput = new GraphQLInputObjectType({
      name: 'ApiMemberCreateInput',
      fields: { display: { type: GraphQLString } },
    });
    const createInput = new GraphQLInputObjectType({
      name: 'ApiConversationCreateInput',
      fields: {
        headline: { type: GraphQLString, defaultValue: 'Untitled' },
        owner: { type: memberInput, defaultValue: { display: 'Ada' } },
        enabled: { type: GraphQLBoolean, defaultValue: false },
        payload: { type: GraphQLJSON, defaultValue: { headline: 'Opaque' } },
      },
    });
    const bindings = {
      ApiConversationCreateInput: {
        headline: 'title',
        owner: 'workspaceMember',
      },
      ApiMemberCreateInput: { display: 'name' },
    };
    const value = coerceInputValue({}, createInput);
    const originalValue: unknown = structuredClone(value);

    expect(
      normalizeWorkspaceApiInputValue({
        value,
        type: new GraphQLNonNull(createInput),
        canonicalFieldNameByApiTypeNameAndApiFieldName: bindings,
      }),
    ).toEqual({
      title: 'Untitled',
      workspaceMember: { name: 'Ada' },
      enabled: false,
      payload: { headline: 'Opaque' },
    });
    expect(
      normalizeWorkspaceApiInputValue({
        value: undefined,
        type: createInput,
        canonicalFieldNameByApiTypeNameAndApiFieldName: bindings,
      }),
    ).toBeUndefined();
    expect(
      normalizeWorkspaceApiInputValue({
        value: null,
        type: createInput,
        canonicalFieldNameByApiTypeNameAndApiFieldName: bindings,
      }),
    ).toBeNull();
    expect(value).toEqual(originalValue);
  });

  it('does not read inherited type or field bindings', () => {
    const type = new GraphQLInputObjectType({
      name: 'constructor',
      fields: {
        name: { type: GraphQLString },
        constructor: { type: GraphQLString },
      },
    });
    const value = { name: 'Ada', constructor: 'Member' };

    expect(
      normalizeWorkspaceApiInputValue({
        value,
        type,
        canonicalFieldNameByApiTypeNameAndApiFieldName: {},
      }),
    ).toEqual(value);
  });
});
