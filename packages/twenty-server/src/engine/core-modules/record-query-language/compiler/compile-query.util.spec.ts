import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { type QueryAst } from 'src/engine/core-modules/record-query-language/types/query-ast.type';
import { compileQuery } from 'src/engine/core-modules/record-query-language/compiler/compile-query.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const makeField = (
  name: string,
  type: FieldMetadataType,
  extra: Record<string, unknown> = {},
): FlatFieldMetadata =>
  ({
    id: `${name}-id`,
    name,
    label: name,
    type,
    isSystem: false,
    isNullable: true,
    ...extra,
  }) as unknown as FlatFieldMetadata;

const personMetadata = {
  id: 'person-object-id',
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  fields: [
    makeField('jobTitle', FieldMetadataType.TEXT),
    makeField('fullName', FieldMetadataType.FULL_NAME),
    makeField('company', FieldMetadataType.RELATION, {
      settings: { relationType: RelationType.MANY_TO_ONE },
    }),
    makeField('closeDate', FieldMetadataType.DATE_TIME),
    makeField('score', FieldMetadataType.NUMBER),
  ],
} as unknown as ObjectMetadataForToolSchema;

const compile = (ast: Partial<QueryAst>) =>
  compileQuery({ from: 'person', ...ast }, personMetadata);

const expectOk = (result: ReturnType<typeof compile>) => {
  if (!result.ok) {
    throw new Error(
      `expected ok, got errors: ${JSON.stringify(result.errors)}`,
    );
  }

  return result.query;
};

const expectErrors = (result: ReturnType<typeof compile>) => {
  if (result.ok) {
    throw new Error('expected errors, got ok');
  }

  return result.errors;
};

describe('compileQuery', () => {
  it('should compile a scalar comparison into the nested filter shape', () => {
    const query = expectOk(
      compile({
        where: { type: 'cmp', field: 'jobTitle', op: 'ilike', value: '%dev%' },
      }),
    );

    expect(query.kind).toBe('find');
    expect(query.filter).toEqual({ jobTitle: { ilike: '%dev%' } });
    if (query.kind === 'find') {
      expect(query.select).toEqual(['*']);
    }
  });

  it('should compile and/or/not into the matching logical tree', () => {
    const query = expectOk(
      compile({
        where: {
          type: 'and',
          of: [
            { type: 'cmp', field: 'jobTitle', op: 'eq', value: 'CEO' },
            {
              type: 'or',
              of: [
                { type: 'cmp', field: 'score', op: 'gte', value: 10 },
                {
                  type: 'not',
                  node: { type: 'cmp', field: 'score', op: 'eq', value: 0 },
                },
              ],
            },
          ],
        },
      }),
    );

    expect(query.filter).toEqual({
      and: [
        { jobTitle: { eq: 'CEO' } },
        {
          or: [{ score: { gte: 10 } }, { not: { score: { eq: 0 } } }],
        },
      ],
    });
  });

  it('should expand composite subfield dot-paths', () => {
    const query = expectOk(
      compile({
        where: {
          type: 'cmp',
          field: 'fullName.firstName',
          op: 'ilike',
          value: '%ada%',
        },
      }),
    );

    expect(query.filter).toEqual({
      fullName: { firstName: { ilike: '%ada%' } },
    });
  });

  it('should resolve a relation to its FK column from either form', () => {
    const fromId = expectOk(
      compile({
        where: {
          type: 'cmp',
          field: 'companyId',
          op: 'eq',
          value: '5f6d1e9c-1a2b-4c3d-8e9f-0a1b2c3d4e5f',
        },
      }),
    );
    const fromName = expectOk(
      compile({
        where: {
          type: 'cmp',
          field: 'company',
          op: 'eq',
          value: '5f6d1e9c-1a2b-4c3d-8e9f-0a1b2c3d4e5f',
        },
      }),
    );

    expect(fromId.filter).toEqual({
      companyId: { eq: '5f6d1e9c-1a2b-4c3d-8e9f-0a1b2c3d4e5f' },
    });
    expect(fromName.filter).toEqual(fromId.filter);
  });

  it('should support in and is operators', () => {
    const inQuery = expectOk(
      compile({
        where: { type: 'cmp', field: 'score', op: 'in', value: [1, 2, 3] },
      }),
    );
    const isQuery = expectOk(
      compile({
        where: { type: 'cmp', field: 'jobTitle', op: 'is', value: 'NULL' },
      }),
    );

    expect(inQuery.filter).toEqual({ score: { in: [1, 2, 3] } });
    expect(isQuery.filter).toEqual({ jobTitle: { is: 'NULL' } });
  });

  it('should error with a suggestion on an unknown field', () => {
    const [error] = expectErrors(
      compile({
        where: { type: 'cmp', field: 'jobTtile', op: 'eq', value: 'CEO' },
      }),
    );

    expect(error.code).toBe('unknown_field');
    expect(error.suggestion).toBe('jobTitle');
    expect(error.path).toBe('where.field');
  });

  it('should reject an operator the field type does not allow', () => {
    const [error] = expectErrors(
      compile({
        where: { type: 'cmp', field: 'jobTitle', op: 'gt', value: 'a' },
      }),
    );

    expect(error.code).toBe('operator_not_allowed');
    expect(error.path).toBe('where.op');
  });

  it('should reject a value of the wrong type', () => {
    const [error] = expectErrors(
      compile({
        where: { type: 'cmp', field: 'score', op: 'eq', value: 'not-a-number' },
      }),
    );

    expect(error.code).toBe('value_type_mismatch');
  });

  it('should require a subfield when targeting a composite field directly', () => {
    const [error] = expectErrors(
      compile({
        where: { type: 'cmp', field: 'fullName', op: 'eq', value: 'Ada' },
      }),
    );

    expect(error.code).toBe('composite_subfield_required');
    expect(error.suggestion).toBe('fullName.firstName');
  });

  it('should reject filtering a relation by a related field (1-hop limit)', () => {
    const [error] = expectErrors(
      compile({
        where: { type: 'cmp', field: 'company.name', op: 'eq', value: 'Acme' },
      }),
    );

    expect(error.code).toBe('relation_path_too_deep');
  });

  it('should map order directions and nulls placement', () => {
    const query = expectOk(
      compile({
        orderBy: [
          { field: 'score', direction: 'desc' },
          { field: 'jobTitle', direction: 'asc', nulls: 'last' },
        ],
      }),
    );

    if (query.kind === 'find') {
      expect(query.orderBy).toEqual([
        { score: OrderByDirection.DescNullsLast },
        { jobTitle: OrderByDirection.AscNullsLast },
      ]);
    }
  });

  it('should pass through limit and offset', () => {
    const query = expectOk(compile({ limit: 25, offset: 50 }));

    if (query.kind === 'find') {
      expect(query.limit).toBe(25);
      expect(query.offset).toBe(50);
    }
  });

  it('should validate explicit select field names', () => {
    expect(expectOk(compile({ select: ['jobTitle', 'companyId'] })).kind).toBe(
      'find',
    );

    const [error] = expectErrors(compile({ select: ['nope'] }));

    expect(error.code).toBe('unknown_field');
    expect(error.path).toBe('select[0]');
  });

  it('should compile an aggregate over a relation dimension', () => {
    const query = expectOk(
      compile({
        aggregate: { groupBy: [{ field: 'companyId' }], operation: 'COUNT' },
      }),
    );

    expect(query.kind).toBe('aggregate');
    if (query.kind === 'aggregate') {
      expect(query.groupBy).toEqual([{ companyId: true }]);
      expect(query.operation).toBe('COUNT');
    }
  });

  it('should compile a date-bucketed aggregate', () => {
    const query = expectOk(
      compile({
        aggregate: {
          groupBy: [{ field: 'closeDate', granularity: 'MONTH' }],
          operation: 'COUNT',
        },
      }),
    );

    if (query.kind === 'aggregate') {
      expect(query.groupBy).toEqual([{ closeDate: { granularity: 'MONTH' } }]);
    }
  });
});
