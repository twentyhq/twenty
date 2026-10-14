import { GraphQLFloat } from 'graphql';
import {
  AggregateOperations,
  FieldMetadataType,
  type ObjectsPermissions,
  RelationType,
} from 'twenty-shared/types';

import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

describe('ProcessAggregateHelper.getAggregateExpression', () => {
  it('should cast rating enum values to integers for numeric operations', () => {
    expect(
      ProcessAggregateHelper.getAggregateExpression(
        {
          type: GraphQLFloat,
          description: '',
          fromField: 'score',
          fromFieldType: FieldMetadataType.RATING,
          aggregateOperation: AggregateOperations.AVG,
        },
        'company',
      ),
    ).toBe(`AVG(CAST(SPLIT_PART("company"."score"::text, '_', 2) AS INTEGER))`);
  });

  it('should aggregate number columns directly', () => {
    expect(
      ProcessAggregateHelper.getAggregateExpression(
        {
          type: GraphQLFloat,
          description: '',
          fromField: 'employees',
          fromFieldType: FieldMetadataType.NUMBER,
          aggregateOperation: AggregateOperations.MAX,
        },
        'company',
      ),
    ).toBe(`MAX("company"."employees")`);
  });

  it('should read columns from the given table alias', () => {
    expect(
      ProcessAggregateHelper.getAggregateExpression(
        {
          type: GraphQLFloat,
          description: '',
          fromField: 'employees',
          fromFieldType: FieldMetadataType.NUMBER,
          aggregateOperation: AggregateOperations.SUM,
        },
        'companyJoinAlias',
      ),
    ).toBe(`SUM("companyJoinAlias"."employees")`);
  });
});

describe('ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder', () => {
  const companyRelationField = {
    id: 'opportunity-company-field-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
    objectMetadataId: 'opportunity-object-id',
    settings: { relationType: RelationType.MANY_TO_ONE },
    relationTargetObjectMetadataId: 'company-object-id',
  } as OrmFlatFieldMetadata<FieldMetadataType.RELATION>;
  const companyEmployeesField = {
    id: 'company-employees-field-id',
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    objectMetadataId: 'company-object-id',
  } as OrmFlatFieldMetadata;
  const companyObject = {
    id: 'company-object-id',
    nameSingular: 'company',
  } as FlatObjectMetadata;

  const sumEmployeesThroughCompany: AggregationField = {
    type: GraphQLFloat,
    description: '',
    fromField: 'employees',
    fromFieldType: FieldMetadataType.NUMBER,
    aggregateOperation: AggregateOperations.SUM,
    throughRelation: {
      relationFieldName: 'company',
      relationFieldMetadata: companyRelationField,
      targetObjectMetadata: companyObject,
      targetFieldMetadata: companyEmployeesField,
      targetAggregationName: 'sumEmployees',
    },
  };
  const sumAmount: AggregationField = {
    type: GraphQLFloat,
    description: '',
    fromField: 'amount',
    fromFieldType: FieldMetadataType.NUMBER,
    aggregateOperation: AggregateOperations.SUM,
  };

  const buildQueryBuilder = ({
    objectRecordsPermissions = {},
    joinAliases = [],
  }: {
    objectRecordsPermissions?: ObjectsPermissions;
    joinAliases?: { name: string; isToMany: boolean }[];
  } = {}) => {
    const queryBuilder = {
      select: jest.fn(),
      addSelect: jest.fn(),
      leftJoin: jest.fn(),
      getJoinAliases: jest.fn(() => joinAliases),
      objectRecordsPermissions,
    };

    return {
      queryBuilder,
      workspaceQueryBuilder:
        queryBuilder as unknown as WorkspaceSelectQueryBuilder,
    };
  };

  it('should join the relation and read traversed aggregates from the join alias', () => {
    const { queryBuilder, workspaceQueryBuilder } = buildQueryBuilder();

    ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields: {
        sumAmount,
        'company.sumEmployees': sumEmployeesThroughCompany,
      },
      queryBuilder: workspaceQueryBuilder,
      objectMetadataNameSingular: 'opportunity',
    });

    expect(queryBuilder.leftJoin).toHaveBeenCalledTimes(1);
    expect(queryBuilder.leftJoin).toHaveBeenCalledWith(
      'opportunity.company',
      'company',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'SUM("opportunity"."amount")',
      'sumAmount',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'SUM("company"."employees")',
      'company.sumEmployees',
    );
  });

  it('should reuse a join alias already present on the query builder', () => {
    const { queryBuilder, workspaceQueryBuilder } = buildQueryBuilder({
      joinAliases: [{ name: 'company', isToMany: false }],
    });

    ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields: {
        'company.sumEmployees': sumEmployeesThroughCompany,
      },
      queryBuilder: workspaceQueryBuilder,
      objectMetadataNameSingular: 'opportunity',
    });

    expect(queryBuilder.leftJoin).not.toHaveBeenCalled();
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'SUM("company"."employees")',
      'company.sumEmployees',
    );
  });

  it('should reject a traversed aggregate when the relation field is not readable', () => {
    const { workspaceQueryBuilder } = buildQueryBuilder({
      objectRecordsPermissions: {
        'opportunity-object-id': {
          restrictedFields: {
            'opportunity-company-field-id': { canRead: false },
          },
        },
      } as unknown as ObjectsPermissions,
    });

    expect(() =>
      ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
        selectedAggregatedFields: {
          'company.sumEmployees': sumEmployeesThroughCompany,
        },
        queryBuilder: workspaceQueryBuilder,
        objectMetadataNameSingular: 'opportunity',
      }),
    ).toThrow(PermissionsException);
  });

  it('should reject a traversed aggregate when the target field is not readable', () => {
    const { workspaceQueryBuilder } = buildQueryBuilder({
      objectRecordsPermissions: {
        'company-object-id': {
          restrictedFields: {
            'company-employees-field-id': { canRead: false },
          },
        },
      } as unknown as ObjectsPermissions,
    });

    expect(() =>
      ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
        selectedAggregatedFields: {
          'company.sumEmployees': sumEmployeesThroughCompany,
        },
        queryBuilder: workspaceQueryBuilder,
        objectMetadataNameSingular: 'opportunity',
      }),
    ).toThrow(PermissionsException);
  });
});
