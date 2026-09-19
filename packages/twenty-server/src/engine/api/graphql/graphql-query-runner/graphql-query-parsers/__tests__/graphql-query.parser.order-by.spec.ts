import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

describe('GraphqlQueryParser order by rendering', () => {
  const workspaceId = 'workspace-id';
  const objectMetadataId = 'object-id';

  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
    },
  ): FlatFieldMetadata =>
    ({
      workspaceId,
      objectMetadataId,
      isNullable: true,
      universalIdentifier: overrides.id,
      label: overrides.name,
      ...overrides,
    }) as FlatFieldMetadata;

  const nameField = createMockField({
    id: 'name-id',
    type: FieldMetadataType.TEXT,
    name: 'name',
  });

  const stageField = createMockField({
    id: 'stage-id',
    type: FieldMetadataType.SELECT,
    name: 'stage',
  });

  const tagsField = createMockField({
    id: 'tags-id',
    type: FieldMetadataType.MULTI_SELECT,
    name: 'tags',
  });

  const closeDateField = createMockField({
    id: 'closedate-id',
    type: FieldMetadataType.DATE_TIME,
    name: 'closeDate',
  });

  const contactNameField = createMockField({
    id: 'contactname-id',
    type: FieldMetadataType.FULL_NAME,
    name: 'contactName',
  });

  const companyField = createMockField({
    id: 'company-id',
    type: FieldMetadataType.RELATION,
    name: 'company',
    relationTargetObjectMetadataId: 'company-object-id',
    settings: {
      relationType: 'MANY_TO_ONE',
      joinColumnName: 'companyId',
      // oxlint-disable-next-line typescript/no-explicit-any
    } as any,
  });

  const companyNameField = createMockField({
    id: 'company-name-id',
    type: FieldMetadataType.TEXT,
    name: 'name',
    objectMetadataId: 'company-object-id',
  });

  const companyContactNameField = createMockField({
    id: 'company-contactname-id',
    type: FieldMetadataType.FULL_NAME,
    name: 'contactName',
    objectMetadataId: 'company-object-id',
  });

  const rootFields = [
    nameField,
    stageField,
    tagsField,
    closeDateField,
    contactNameField,
    companyField,
  ];
  const fields = [...rootFields, companyNameField, companyContactNameField];

  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.universalIdentifier, field]),
    ),
    universalIdentifierById: Object.fromEntries(
      fields.map((field) => [field.id, field.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  };

  const flatObjectMetadata = {
    id: objectMetadataId,
    workspaceId,
    nameSingular: 'opportunity',
    fieldIds: rootFields.map((field) => field.id),
  } as unknown as FlatObjectMetadata;

  const companyObjectMetadata = {
    id: 'company-object-id',
    universalIdentifier: 'company-object-id',
    workspaceId,
    nameSingular: 'company',
    fieldIds: ['company-name-id', 'company-contactname-id'],
  } as unknown as FlatObjectMetadata;

  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
    byUniversalIdentifier: {
      [objectMetadataId]: flatObjectMetadata,
      'company-object-id': companyObjectMetadata,
    },
    universalIdentifierById: {
      [objectMetadataId]: objectMetadataId,
      'company-object-id': 'company-object-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  const buildQueryBuilderSpy = () => {
    const orderBy = jest.fn();

    return {
      orderBy,
      queryBuilder: {
        objectRecordsPermissions: {},
        getJoinAliases: () => [],
        orderBy,
        leftJoin: jest.fn(),
      } as unknown as WorkspaceSelectQueryBuilder,
    };
  };

  // oxlint-disable-next-line typescript/no-explicit-any
  const applyOrderBy = (orderBy: any) => {
    const { orderBy: orderBySpy, queryBuilder } = buildQueryBuilderSpy();

    new GraphqlQueryParser(
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    ).applyOrderToBuilder(queryBuilder, orderBy, 'opportunity');

    return orderBySpy.mock.calls[0][0];
  };

  it('should hand a case-insensitively ordered column to the builder already wrapped in LOWER()', () => {
    expect(applyOrderBy([{ name: OrderByDirection.AscNullsLast }])).toEqual({
      'LOWER("opportunity"."name")': { order: 'ASC', nulls: 'NULLS LAST' },
    });
  });

  it('should cast a SELECT column to text before lowercasing it', () => {
    expect(applyOrderBy([{ stage: OrderByDirection.DescNullsFirst }])).toEqual({
      'LOWER("opportunity"."stage"::text)': {
        order: 'DESC',
        nulls: 'NULLS FIRST',
      },
    });
  });

  it('should leave a column the ordering compares raw in its unrendered form', () => {
    expect(
      applyOrderBy([
        { closeDate: OrderByDirection.AscNullsLast },
        { tags: OrderByDirection.AscNullsLast },
      ]),
    ).toEqual({
      'opportunity.closeDate': { order: 'ASC', nulls: 'NULLS LAST' },
      'opportunity.tags': { order: 'ASC', nulls: 'NULLS LAST' },
    });
  });

  it('should wrap a composite text sub-column and a relation target column', () => {
    expect(
      applyOrderBy([
        { contactName: { firstName: OrderByDirection.AscNullsLast } },
        { company: { name: OrderByDirection.AscNullsLast } },
      ]),
    ).toEqual({
      'LOWER("opportunity"."contactNameFirstName")': {
        order: 'ASC',
        nulls: 'NULLS LAST',
      },
      'LOWER("company"."name")': { order: 'ASC', nulls: 'NULLS LAST' },
    });
  });

  it('should wrap a composite text sub-column of a relation target', () => {
    expect(
      applyOrderBy([
        {
          company: { contactName: { lastName: OrderByDirection.AscNullsLast } },
        },
      ]),
    ).toEqual({
      'LOWER("company"."contactNameLastName")': {
        order: 'ASC',
        nulls: 'NULLS LAST',
      },
    });
  });

  it('should keep the requested order of the clauses', () => {
    expect(
      Object.keys(
        applyOrderBy([
          { closeDate: OrderByDirection.AscNullsLast },
          { name: OrderByDirection.AscNullsLast },
        ]),
      ),
    ).toEqual(['opportunity.closeDate', 'LOWER("opportunity"."name")']);
  });
});
