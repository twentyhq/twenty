import {
  createWhereExpressionRecorder,
  type RecordedWhereCall,
} from 'test/utils/create-where-expression-recorder.util';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { type ParentFilterScope } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-field.parser';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';

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

const createdAtField = createFlatFieldMetadata({
  id: 'created-at-field-id',
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
  universalIdentifier: 'created-at-field-universal-id',
});

const lastContactAtField = createFlatFieldMetadata({
  id: 'last-contact-at-field-id',
  name: 'lastContactAt',
  type: FieldMetadataType.DATE_TIME,
  universalIdentifier: 'last-contact-at-field-universal-id',
});

const companyPeopleField = createFlatFieldMetadata({
  id: 'company-people-field-id',
  name: 'people',
  type: FieldMetadataType.RELATION,
  relationTargetFieldMetadataId: 'person-company-field-id',
  settings: { relationType: RelationType.ONE_TO_MANY },
  universalIdentifier: 'company-people-field-universal-id',
});

const companyAccountOwnerField = createFlatFieldMetadata({
  id: 'company-account-owner-field-id',
  name: 'accountOwner',
  type: FieldMetadataType.RELATION,
  relationTargetFieldMetadataId: 'workspace-member-companies-field-id',
  settings: { relationType: RelationType.MANY_TO_ONE },
  universalIdentifier: 'company-account-owner-field-universal-id',
});

const companyFields = [
  nameField,
  employeesField,
  createdAtField,
  lastContactAtField,
  companyPeopleField,
  companyAccountOwnerField,
];

const personUpdatedAtField = createFlatFieldMetadata({
  id: 'person-updated-at-field-id',
  name: 'updatedAt',
  type: FieldMetadataType.DATE_TIME,
  universalIdentifier: 'person-updated-at-field-universal-id',
});

const personFields = [personUpdatedAtField];

const companyObjectMetadata = {
  id: 'company-object-id',
  nameSingular: 'company',
  namePlural: 'companies',
  fieldIds: companyFields.map((field) => field.id),
  universalIdentifier: 'company-object-universal-id',
} as FlatObjectMetadata;

const personObjectMetadata = {
  id: 'person-object-id',
  nameSingular: 'person',
  namePlural: 'people',
  fieldIds: personFields.map((field) => field.id),
  universalIdentifier: 'person-object-universal-id',
} as FlatObjectMetadata;

const allFields = [...companyFields, ...personFields];

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    allFields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    allFields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
};

const outerQueryBuilder = {
  objectRecordsPermissions: {},
} as unknown as WorkspaceSelectQueryBuilder;

const recordFilterEntries = (
  filter: Record<string, unknown>,
  parentFilterScope?: ParentFilterScope,
  queryBuilder: WorkspaceSelectQueryBuilder = outerQueryBuilder,
) => {
  const recorder = createWhereExpressionRecorder();
  const parser = new GraphqlQueryFilterConditionParser(
    companyObjectMetadata,
    flatFieldMetadataMaps,
    undefined,
    isDefined(parentFilterScope) ? 1 : 0,
    parentFilterScope,
  );

  parser.applyFilterEntriesToWhereBrackets(
    recorder.whereExpression,
    queryBuilder,
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
  });

  describe('field references', () => {
    const getSql = (calls: RecordedWhereCall[]) => {
      const node = calls[0]?.node;

      if (node?.kind !== 'sql') {
        throw new Error('Expected a sql node');
      }

      return node;
    };

    it('compares two columns of the same record without parameters', () => {
      const node = getSql(
        recordFilterEntries({ lastContactAt: { gtField: 'createdAt' } }),
      );

      expect(node.sql).toBe(
        '"company"."lastContactAt" > "company"."createdAt"',
      );
      expect(node.parameters ?? {}).toEqual({});
    });

    const personParentFilterScope: ParentFilterScope = {
      flatObjectMetadata: personObjectMetadata,
      alias: 'person',
      relationFieldMetadataId: 'person-company-field-id',
    };

    it('compares with a column of the record the relation filter starts from', () => {
      const node = getSql(
        recordFilterEntries(
          { lastContactAt: { lteField: 'people.updatedAt' } },
          personParentFilterScope,
        ),
      );

      expect(node.sql).toBe(
        '"company"."lastContactAt" <= "person"."updatedAt"',
      );
    });

    it('rejects a relation reference outside a relation filter', () => {
      expect(() =>
        recordFilterEntries({ lastContactAt: { ltField: 'people.updatedAt' } }),
      ).toThrow('leads back to the record the relation filter starts from');
    });

    it('rejects a relation that does not lead back to the parent record', () => {
      expect(() =>
        recordFilterEntries(
          { lastContactAt: { ltField: 'accountOwner.updatedAt' } },
          personParentFilterScope,
        ),
      ).toThrow('leads back to the record the relation filter starts from');
    });

    it('rejects a field that does not exist rather than writing it into the query', () => {
      expect(() =>
        recordFilterEntries({
          lastContactAt: { gtField: 'createdAt"; DROP TABLE company; --' },
        }),
      ).toThrow('was not found');
    });

    it('rejects a referenced field the role cannot read', () => {
      const restrictedQueryBuilder = {
        objectRecordsPermissions: {
          [companyObjectMetadata.id]: {
            restrictedFields: { [createdAtField.id]: { canRead: false } },
          },
        },
      } as unknown as WorkspaceSelectQueryBuilder;

      expect(() =>
        recordFilterEntries(
          { lastContactAt: { gtField: 'createdAt' } },
          undefined,
          restrictedQueryBuilder,
        ),
      ).toThrow(PermissionsException);
    });
  });
});
