import {
  buildSchema,
  graphqlSync,
  type GraphQLResolveInfo,
  print,
} from 'graphql';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { normalizeWorkspaceApiGraphqlResolveInfo } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-resolve-info.util';

it('normalizes cloned field nodes and keeps actual fragments when the helper name is already used', () => {
  const apiSchema = buildSchema(`
    type Query { records: [ApiRecord!]! }
    type ApiRecord { display: String }
  `);
  const canonicalSchema = buildSchema(`
    type Query { entries: [Record!]! }
    type Record { title: String }
  `);
  const resolveInfoByFieldName = new Map<string, GraphQLResolveInfo>();
  const rootValue = { records: [] };
  const result = graphqlSync({
    schema: apiSchema,
    source: `
      query Browse($shown: Boolean! = true) {
        rows: records {
          direct: display
          ...WorkspaceApiResolveInfoFields
        }
      }
      fragment WorkspaceApiResolveInfoFields on ApiRecord {
        alias: display @include(if: $shown)
      }
    `,
    rootValue,
    fieldResolver: (_source, _arguments, _context, info) => {
      resolveInfoByFieldName.set(info.fieldName, info);

      return [];
    },
  });
  const info = resolveInfoByFieldName.get('records');

  expect(result.errors).toBeUndefined();
  assertIsDefinedOrThrow(info);

  const clonedFieldNodes = info.fieldNodes.map((fieldNode) => ({
    ...fieldNode,
  }));
  const normalizedInfo = normalizeWorkspaceApiGraphqlResolveInfo({
    info: { ...info, fieldNodes: clonedFieldNodes },
    canonicalSchema,
    canonicalFieldName: 'entries',
    canonicalTypeNameByApiTypeName: { ApiRecord: 'Record' },
    canonicalFieldNameByApiTypeNameAndApiFieldName: {
      Query: { records: 'entries' },
      ApiRecord: { display: 'title' },
    },
  });

  expect(clonedFieldNodes[0]).not.toBe(info.fieldNodes[0]);
  expect(print(normalizedInfo.fieldNodes[0])).toBe(
    'rows: entries {\n  direct: title\n  ...WorkspaceApiResolveInfoFields\n}',
  );
  expect(Object.keys(normalizedInfo.fragments)).toEqual([
    'WorkspaceApiResolveInfoFields',
  ]);
  expect(print(normalizedInfo.fragments.WorkspaceApiResolveInfoFields)).toBe(
    'fragment WorkspaceApiResolveInfoFields on Record {\n  alias: title @include(if: $shown)\n}',
  );
  expect(normalizedInfo.operation.name).toBe(info.operation.name);
  expect(normalizedInfo.path).toBe(info.path);
  expect(normalizedInfo.rootValue).toBe(rootValue);
  expect(info.fieldNodes[0].name.value).toBe('records');
});
