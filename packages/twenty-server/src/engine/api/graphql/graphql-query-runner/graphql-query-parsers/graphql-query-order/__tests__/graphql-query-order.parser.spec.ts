import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('GraphqlQueryOrderFieldParser', () => {
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
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      label: overrides.name,
      ...overrides,
    }) as FlatFieldMetadata;

  const closeDateField = createMockField({
    id: 'closedate-id',
    type: FieldMetadataType.DATE_TIME,
    name: 'closeDate',
  });

  const stageField = createMockField({
    id: 'stage-id',
    type: FieldMetadataType.TEXT,
    name: 'stage',
  });

  const fullNameField = createMockField({
    id: 'fullname-id',
    type: FieldMetadataType.FULL_NAME,
    name: 'fullName',
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

  const rootFields = [closeDateField, stageField, fullNameField, companyField];
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

  const parser = new GraphqlQueryOrderFieldParser(
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  );

  it('should compile scalar, composite and relation leaves to their columns', () => {
    const result = parser.parse(
      [
        { closeDate: OrderByDirection.DescNullsLast },
        { fullName: { firstName: OrderByDirection.AscNullsLast } },
        { company: { name: OrderByDirection.AscNullsLast } },
        // oxlint-disable-next-line typescript/no-explicit-any
      ] as any,
      'opportunity',
    );

    expect(result.orderBy).toEqual({
      'opportunity.closeDate': {
        order: 'DESC',
        nulls: 'NULLS LAST',
        useLower: false,
        castToText: false,
      },
      'opportunity.fullNameFirstName': {
        order: 'ASC',
        nulls: 'NULLS LAST',
        useLower: true,
        castToText: false,
      },
      'company.name': {
        order: 'ASC',
        nulls: 'NULLS LAST',
        useLower: true,
        castToText: false,
      },
    });
    expect(result.relationJoins).toEqual([{ joinAlias: 'company' }]);
  });

  it('should compile a composite target field of a relation onto the join alias', () => {
    const result = parser.parse(
      [
        {
          company: {
            contactName: { firstName: OrderByDirection.AscNullsLast },
          },
        },
        {
          company: { contactName: { lastName: OrderByDirection.AscNullsLast } },
        },
        // oxlint-disable-next-line typescript/no-explicit-any
      ] as any,
      'opportunity',
    );

    expect(Object.keys(result.orderBy)).toEqual([
      'company.contactNameFirstName',
      'company.contactNameLastName',
    ]);
    // Two leaves through the same relation share one join
    expect(result.relationJoins).toEqual([{ joinAlias: 'company' }]);
  });

  it('should treat a join column access as a scalar of the root object', () => {
    const result = parser.parse(
      [{ companyId: OrderByDirection.AscNullsFirst }],
      'opportunity',
    );

    expect(result.orderBy).toEqual({
      'opportunity.companyId': {
        order: 'ASC',
        nulls: 'NULLS FIRST',
        useLower: false,
        castToText: false,
      },
    });
    expect(result.relationJoins).toEqual([]);
  });

  it('should reverse direction and NULLS placement for backward pagination', () => {
    const result = parser.parse(
      [{ stage: OrderByDirection.AscNullsLast }],
      'opportunity',
      false,
    );

    expect(result.orderBy['opportunity.stage']).toMatchObject({
      order: 'DESC',
      nulls: 'NULLS FIRST',
    });
  });

  it('should keep the first direction when the same field is ordered twice', () => {
    const result = parser.parse(
      [
        { stage: OrderByDirection.AscNullsLast },
        { stage: OrderByDirection.DescNullsFirst },
      ],
      'opportunity',
    );

    expect(result.orderBy['opportunity.stage']).toMatchObject({
      order: 'ASC',
      nulls: 'NULLS LAST',
    });
  });

  it('should reject ordering by a field the role cannot read', () => {
    expect(() =>
      parser.parse(
        [{ stage: OrderByDirection.AscNullsLast }],
        'opportunity',
        true,
        {
          [objectMetadataId]: {
            restrictedFields: { 'stage-id': { canRead: false } },
            // oxlint-disable-next-line typescript/no-explicit-any
          } as any,
        },
      ),
    ).toThrow('does not have permission');
  });

  it('should reject unknown fields', () => {
    expect(() =>
      parser.parse(
        [{ unknownField: OrderByDirection.AscNullsLast }],
        'opportunity',
      ),
    ).toThrow('does not exist or is not sortable');
  });
});
