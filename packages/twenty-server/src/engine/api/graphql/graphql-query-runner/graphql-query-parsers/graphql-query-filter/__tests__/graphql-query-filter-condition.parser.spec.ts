import {
  createWhereExpressionRecorder,
  type RecordedWhereCall,
} from 'test/utils/create-where-expression-recorder.util';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
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

const withNormalizedParameterKeys = (calls: RecordedWhereCall[]): unknown[] =>
  calls.map(({ method, node }) =>
    node.kind === 'sql'
      ? {
          method,
          sql: node.sql.replace(/(?<!:):[A-Za-z0-9_]+/g, ':parameter'),
          parameterValues: Object.values(node.parameters ?? {}),
        }
      : {
          method,
          kind: node.kind,
          children: withNormalizedParameterKeys(node.children),
        },
  );

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

    it('applies an or group that is not wrapped in an array', () => {
      const calls = recordFilterEntries({ or: { name: { ilike: '%acme%' } } });

      expect(withNormalizedParameterKeys(calls)).toEqual(
        withNormalizedParameterKeys(
          recordFilterEntries({ or: [{ name: { ilike: '%acme%' } }] }),
        ),
      );
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

    it('uses a correlated exists subquery for a one-to-many relation', () => {
      const sourceRelationField = createFlatFieldMetadata({
        id: 'fellowships-field-id',
        name: 'fellowships',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'person-object-id',
        universalIdentifier: 'fellowships-field-universal-id',
        relationTargetObjectMetadataId: 'fellowship-object-id',
        relationTargetFieldMetadataId: 'person-field-id',
        settings: { relationType: RelationType.ONE_TO_MANY },
      });
      const targetRelationField = createFlatFieldMetadata({
        id: 'person-field-id',
        name: 'person',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'fellowship-object-id',
        universalIdentifier: 'person-field-universal-id',
        relationTargetObjectMetadataId: 'person-object-id',
        relationTargetFieldMetadataId: 'fellowships-field-id',
        settings: { relationType: RelationType.MANY_TO_ONE },
      });
      const cohortField = createFlatFieldMetadata({
        id: 'cohort-field-id',
        name: 'cohort',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'fellowship-object-id',
        universalIdentifier: 'cohort-field-universal-id',
      });
      const personObjectMetadata = {
        id: 'person-object-id',
        nameSingular: 'person',
        namePlural: 'people',
        fieldIds: [sourceRelationField.id],
        universalIdentifier: 'person-object-universal-id',
      } as FlatObjectMetadata;
      const fellowshipObjectMetadata = {
        id: 'fellowship-object-id',
        nameSingular: 'fellowship',
        namePlural: 'fellowships',
        fieldIds: [targetRelationField.id, cohortField.id],
        universalIdentifier: 'fellowship-object-universal-id',
      } as FlatObjectMetadata;
      const relationFieldMaps = {
        byUniversalIdentifier: Object.fromEntries(
          [sourceRelationField, targetRelationField, cohortField].map(
            (field) => [field.universalIdentifier, field],
          ),
        ),
        universalIdentifierById: Object.fromEntries(
          [sourceRelationField, targetRelationField, cohortField].map(
            (field) => [field.id, field.universalIdentifier],
          ),
        ),
        universalIdentifiersByApplicationId: {},
      } as FlatEntityMaps<FlatFieldMetadata>;
      const objectMetadataMaps = {
        byUniversalIdentifier: {
          [personObjectMetadata.universalIdentifier]: personObjectMetadata,
          [fellowshipObjectMetadata.universalIdentifier]:
            fellowshipObjectMetadata,
        },
        universalIdentifierById: {
          [personObjectMetadata.id]: personObjectMetadata.universalIdentifier,
          [fellowshipObjectMetadata.id]:
            fellowshipObjectMetadata.universalIdentifier,
        },
        universalIdentifiersByApplicationId: {},
      } as FlatEntityMaps<FlatObjectMetadata>;

      const subQueryWhereCalls: string[] = [];
      const subQuery = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn(),
        andWhere: jest.fn(),
        getQuery: jest.fn(() => '(SELECT 1 FROM fellowship)'),
        getParameters: jest.fn(() => ({})),
      };

      subQuery.where.mockImplementation((sql: string) => {
        subQueryWhereCalls.push(sql);
        return subQuery;
      });
      subQuery.andWhere.mockImplementation((sql: string) => {
        subQueryWhereCalls.push(sql);
        return subQuery;
      });
      const queryBuilder = {
        objectRecordsPermissions: {},
        shouldBypassPermissionChecks: true,
        expressionMap: {
          findAliasByName: jest.fn(() => ({
            metadata: {
              findRelationWithPropertyPath: jest.fn(() => ({
                inverseEntityMetadata: { target: 'fellowship' },
              })),
            },
          })),
        },
        subQuery: jest.fn(() => subQuery),
      } as unknown as WorkspaceSelectQueryBuilder<ObjectLiteral>;
      const recorder = createWhereExpressionRecorder();
      const parser = new GraphqlQueryFilterConditionParser(
        personObjectMetadata,
        relationFieldMaps,
        objectMetadataMaps,
      );

      parser.applyFilterEntriesToWhereBrackets(
        recorder.whereExpression,
        queryBuilder,
        'person',
        { fellowships: { cohort: { eq: 'Brains' } } },
      );

      expect(queryBuilder.subQuery).toHaveBeenCalledTimes(1);
      expect(subQuery.from).toHaveBeenCalledWith(
        'fellowship',
        'person_fellowships_exists_0',
      );
      expect(subQueryWhereCalls).toEqual([
        expect.stringContaining('"person_fellowships_exists_0"."cohort"'),
        '"person_fellowships_exists_0"."personId" = "person"."id"',
      ]);
      expect(recorder.calls[0]).toEqual({
        method: 'where',
        node: expect.objectContaining({
          kind: 'sql',
          sql: 'EXISTS (SELECT 1 FROM fellowship)',
        }),
      });
    });
  });
});
