import { createWhereExpressionRecorder } from 'test/utils/create-where-expression-recorder.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

const createFlatFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'field-id',
    name: 'field',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'field-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const nameField = createFlatFieldMetadata({
  id: 'name-field-id',
  name: 'name',
  type: FieldMetadataType.TEXT,
  universalIdentifier: 'name-field-universal-id',
});

const employeesField = createFlatFieldMetadata({
  id: 'employees-field-id',
  name: 'employees',
  type: FieldMetadataType.NUMBER,
  universalIdentifier: 'employees-field-universal-id',
});

const companyFields = [nameField, employeesField];

const companyObjectMetadata = {
  id: 'company-object-id',
  nameSingular: 'company',
  namePlural: 'companies',
  fieldIds: companyFields.map((field) => field.id),
  universalIdentifier: 'company-object-universal-id',
} as FlatObjectMetadata;

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    companyFields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    companyFields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
};

const outerQueryBuilder = {
  objectRecordsPermissions: {},
} as unknown as WorkspaceSelectQueryBuilder<ObjectLiteral>;

const recordFilterEntries = (filter: Record<string, unknown>) => {
  const recorder = createWhereExpressionRecorder();
  const parser = new GraphqlQueryFilterConditionParser(
    companyObjectMetadata,
    flatFieldMetadataMaps,
  );

  parser.applyFilterEntriesToWhereBrackets(
    recorder.whereExpression,
    outerQueryBuilder,
    'company',
    filter,
  );

  return recorder.calls;
};

describe('GraphqlQueryFilterConditionParser', () => {
  describe('applyFilterEntriesToWhereBrackets', () => {
    it('emits the first entry with where and later entries with andWhere', () => {
      const calls = recordFilterEntries({
        name: { ilike: '%acme%' },
        employees: { gte: 5 },
      });

      expect(calls).toHaveLength(2);
      expect(calls[0].method).toBe('where');
      expect(calls[1].method).toBe('andWhere');
      expect(calls[0].node.kind).toBe('sql');
      expect(calls[1].node.kind).toBe('sql');
    });

    it('passes the leaf condition and its parameters through to the query builder', () => {
      const calls = recordFilterEntries({ name: { ilike: '%acme%' } });

      expect(calls).toHaveLength(1);

      const node = calls[0].node;

      if (node.kind !== 'sql') {
        throw new Error('Expected a sql node');
      }

      expect(node.sql).toContain('"company"."name"');
      expect(Object.values(node.parameters ?? {})).toEqual(['%acme%']);
    });

    it('wraps an and group in brackets and joins its elements with andWhere', () => {
      const calls = recordFilterEntries({
        and: [{ name: { ilike: '%a%' } }, { employees: { gte: 1 } }],
      });

      expect(calls).toEqual([
        {
          method: 'where',
          node: {
            kind: 'brackets',
            children: [
              {
                method: 'where',
                node: {
                  kind: 'brackets',
                  children: [
                    {
                      method: 'where',
                      node: expect.objectContaining({ kind: 'sql' }),
                    },
                  ],
                },
              },
              {
                method: 'andWhere',
                node: {
                  kind: 'brackets',
                  children: [
                    {
                      method: 'where',
                      node: expect.objectContaining({ kind: 'sql' }),
                    },
                  ],
                },
              },
            ],
          },
        },
      ]);
    });

    it('wraps an or group in brackets and joins its elements with orWhere', () => {
      const calls = recordFilterEntries({
        or: [{ name: { ilike: '%a%' } }, { employees: { gte: 1 } }],
      });

      expect(calls).toEqual([
        {
          method: 'where',
          node: {
            kind: 'brackets',
            children: [
              {
                method: 'where',
                node: expect.objectContaining({ kind: 'brackets' }),
              },
              {
                method: 'orWhere',
                node: expect.objectContaining({ kind: 'brackets' }),
              },
            ],
          },
        },
      ]);
    });

    it('emits a not group as notBrackets', () => {
      const calls = recordFilterEntries({ not: { name: { ilike: '%a%' } } });

      expect(calls).toEqual([
        {
          method: 'where',
          node: {
            kind: 'notBrackets',
            children: [
              {
                method: 'where',
                node: expect.objectContaining({ kind: 'sql' }),
              },
            ],
          },
        },
      ]);
    });

    it('attaches a logical group with andWhere when it is not the first entry', () => {
      const calls = recordFilterEntries({
        name: { ilike: '%a%' },
        and: [{ employees: { gte: 1 } }],
      });

      expect(calls).toHaveLength(2);
      expect(calls[0]).toEqual({
        method: 'where',
        node: expect.objectContaining({ kind: 'sql' }),
      });
      expect(calls[1]).toEqual({
        method: 'andWhere',
        node: expect.objectContaining({ kind: 'brackets' }),
      });
    });

    it('recurses through nested logical groups', () => {
      const calls = recordFilterEntries({
        and: [{ or: [{ not: { name: { ilike: '%a%' } } }] }],
      });

      expect(calls).toEqual([
        {
          method: 'where',
          node: {
            kind: 'brackets',
            children: [
              {
                method: 'where',
                node: {
                  kind: 'brackets',
                  children: [
                    {
                      method: 'where',
                      node: {
                        kind: 'brackets',
                        children: [
                          {
                            method: 'where',
                            node: {
                              kind: 'brackets',
                              children: [
                                {
                                  method: 'where',
                                  node: {
                                    kind: 'notBrackets',
                                    children: [
                                      {
                                        method: 'where',
                                        node: expect.objectContaining({
                                          kind: 'sql',
                                        }),
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]);
    });

    it('emits nothing for an empty filter', () => {
      expect(recordFilterEntries({})).toEqual([]);
    });
  });
});
