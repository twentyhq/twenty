import { buildSchema, parse, print } from 'graphql';

import { normalizeWorkspaceApiGraphqlDocument } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-document.util';

const API_SCHEMA = buildSchema(`
  scalar RAW_JSON
  directive @trace(label: String, payload: RAW_JSON) on QUERY | FIELD
  enum Status {
    READY
  }
  type Query {
    articles: [Article!]!
    company: Company
  }
  type Mutation {
    createArticles(data: ArticleInput!): Article!
    createManyArticles(data: [ArticleInput!]!): [Article!]!
  }
  type Company {
    comments: String
    records: [Article!]!
  }
  type Article {
    id: ID!
    comments: [Comment!]!
  }
  type Comment {
    body: String
    article: Article
  }
  input ArticleInput {
    title: String
    comments: [CommentInput!]
    payload: RAW_JSON
    status: Status
  }
  input CommentInput {
    body: String
    article: ArticleInput
  }
`);
const CANONICAL_TYPE_NAME_BY_API_TYPE_NAME = {
  Article: 'Entry',
  Comment: 'Remark',
  ArticleInput: 'EntryInput',
  CommentInput: 'RemarkInput',
};
const CANONICAL_FIELD_NAME_BY_API_TYPE_NAME_AND_API_FIELD_NAME = {
  Query: { articles: 'entries' },
  Mutation: {
    createArticles: 'createEntries',
    createManyArticles: 'createManyEntries',
  },
  Article: { comments: 'remarks' },
  Comment: { article: 'entry' },
  ArticleInput: { comments: 'remarks' },
  CommentInput: { article: 'entry' },
  RAW_JSON: { comments: 'remarks', article: 'entry' },
};

describe('normalizeWorkspaceApiGraphqlDocument', () => {
  it('normalizes nested fields and fragment types using their API parent types', () => {
    const source = `
      query Browse($include: Boolean!) @trace(label: "Article") {
        results: articles @trace(label: "comments") {
          articleId: id
          __typename
          ...ArticleFields
          ... on Article @include(if: $include) {
            messages: comments {
              text: body
              article { id }
            }
          }
        }
        company {
          comments
          records { comments { body } }
        }
      }
      fragment ArticleFields on Article {
        comments { ...CommentFields }
      }
      fragment CommentFields on Comment { body }
    `;
    const document = parse(source);
    const normalizedDocument = normalizeWorkspaceApiGraphqlDocument({
      document,
      schema: API_SCHEMA,
      canonicalTypeNameByApiTypeName: CANONICAL_TYPE_NAME_BY_API_TYPE_NAME,
      canonicalFieldNameByApiTypeNameAndApiFieldName:
        CANONICAL_FIELD_NAME_BY_API_TYPE_NAME_AND_API_FIELD_NAME,
    });

    expect(print(normalizedDocument)).toBe(
      print(
        parse(`
        query Browse($include: Boolean!) @trace(label: "Article") {
          results: entries @trace(label: "comments") {
            articleId: id
            __typename
            ...ArticleFields
            ... on Entry @include(if: $include) {
              messages: remarks {
                text: body
                entry { id }
              }
            }
          }
          company {
            comments
            records { remarks { body } }
          }
        }
        fragment ArticleFields on Entry {
          remarks { ...CommentFields }
        }
        fragment CommentFields on Remark { body }
      `),
      ),
    );
    expect(print(document)).toBe(print(parse(source)));
  });

  it('normalizes variable types and nested input keys while preserving scalar values', () => {
    const document = parse(`
      mutation Save(
        $data: ArticleInput!
        $defaults: [ArticleInput!]! = [{
          comments: [{ body: "Article", article: { title: "comments" } }]
        }]
      ) {
        createArticles(data: $data) { id }
        batch: createManyArticles(data: $defaults) { id }
        created: createArticles(data: {
          title: "Article"
          status: READY
          comments: [{ body: "comments", article: { title: "Article" } }]
          payload: { comments: [{ article: "Article", nested: { comments: "comments" } }] }
        }) { comments { body } }
      }
    `);
    const normalizedDocument = normalizeWorkspaceApiGraphqlDocument({
      document,
      schema: API_SCHEMA,
      canonicalTypeNameByApiTypeName: CANONICAL_TYPE_NAME_BY_API_TYPE_NAME,
      canonicalFieldNameByApiTypeNameAndApiFieldName:
        CANONICAL_FIELD_NAME_BY_API_TYPE_NAME_AND_API_FIELD_NAME,
    });

    expect(print(normalizedDocument)).toBe(
      print(
        parse(`
        mutation Save(
          $data: EntryInput!
          $defaults: [EntryInput!]! = [{
            remarks: [{ body: "Article", entry: { title: "comments" } }]
          }]
        ) {
          createEntries(data: $data) { id }
          batch: createManyEntries(data: $defaults) { id }
          created: createEntries(data: {
            title: "Article"
            status: READY
            remarks: [{ body: "comments", entry: { title: "Article" } }]
            payload: { comments: [{ article: "Article", nested: { comments: "comments" } }] }
          }) { remarks { body } }
        }
      `),
      ),
    );
  });

  it('returns the original document when no names are mapped', () => {
    const document = parse(`
      query Browse {
        articles @trace(payload: { comments: { article: "Article" } }) {
          comments { body }
        }
      }
    `);

    expect(
      normalizeWorkspaceApiGraphqlDocument({
        document,
        schema: API_SCHEMA,
        canonicalTypeNameByApiTypeName: {},
        canonicalFieldNameByApiTypeNameAndApiFieldName: {},
      }),
    ).toBe(document);
  });
});
