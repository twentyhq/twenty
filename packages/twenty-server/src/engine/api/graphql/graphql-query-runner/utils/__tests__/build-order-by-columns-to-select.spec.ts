import {
  FieldMetadataType,
  OrderByDirection,
  RelationType,
} from 'twenty-shared/types';

import { buildOrderByColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-order-by-columns-to-select';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildMockField = (
  id: string,
  name: string,
  type: FieldMetadataType,
  overrides: Partial<FlatFieldMetadata> = {},
): FlatFieldMetadata =>
  ({
    id,
    universalIdentifier: id,
    name,
    type,
    objectMetadataId: 'obj-id',
    workspaceId: 'ws-id',
    label: name,
    isNullable: true,
    ...overrides,
  }) as unknown as FlatFieldMetadata;

const closeDateField = buildMockField(
  'closedate-id',
  'closeDate',
  FieldMetadataType.DATE_TIME,
);
const fullNameField = buildMockField(
  'fullname-id',
  'name',
  FieldMetadataType.FULL_NAME,
);
const companyField = buildMockField(
  'company-id',
  'company',
  FieldMetadataType.RELATION,
  { settings: { relationType: RelationType.MANY_TO_ONE } },
);
const ownerField = buildMockField(
  'owner-id',
  'owner',
  FieldMetadataType.MORPH_RELATION,
  { settings: { relationType: RelationType.MANY_TO_ONE } },
);

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {
    'closedate-id': closeDateField,
    'fullname-id': fullNameField,
    'company-id': companyField,
    'owner-id': ownerField,
  },
  universalIdentifierById: {
    'closedate-id': 'closedate-id',
    'fullname-id': 'fullname-id',
    'company-id': 'company-id',
    'owner-id': 'owner-id',
  },
  universalIdentifiersByApplicationId: {},
};

const flatObjectMetadata = {
  id: 'obj-id',
  universalIdentifier: 'obj-id',
  nameSingular: 'opportunity',
  fieldIds: ['closedate-id', 'fullname-id', 'company-id', 'owner-id'],
} as unknown as FlatObjectMetadata;

describe('buildOrderByColumnsToSelect', () => {
  it('should select the column of a scalar orderBy field', () => {
    const result = buildOrderByColumnsToSelect({
      orderBy: [{ closeDate: OrderByDirection.AscNullsLast }],
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ closeDate: true });
  });

  it('should expand composite orderBy fields to their flat sub-field columns', () => {
    const result = buildOrderByColumnsToSelect({
      orderBy: [
        {
          name: {
            firstName: OrderByDirection.AscNullsLast,
            lastName: OrderByDirection.DescNullsLast,
          },
        },
      ],
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ nameFirstName: true, nameLastName: true });
  });

  it('should skip relation orderBy fields accessed by relation name', () => {
    const result = buildOrderByColumnsToSelect({
      orderBy: [
        { company: { name: OrderByDirection.AscNullsLast } },
        { closeDate: OrderByDirection.AscNullsLast },
      ],
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ closeDate: true });
  });

  it('should skip morph relation orderBy fields like relation ones', () => {
    const result = buildOrderByColumnsToSelect({
      orderBy: [
        { owner: { name: OrderByDirection.AscNullsLast } },
        { closeDate: OrderByDirection.AscNullsLast },
      ],
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ closeDate: true });
  });

  it('should select the join column when ordering by the foreign key', () => {
    const result = buildOrderByColumnsToSelect({
      orderBy: [{ companyId: OrderByDirection.AscNullsLast }],
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ companyId: true });
  });

  it('should skip unknown fields and handle undefined orderBy', () => {
    expect(
      buildOrderByColumnsToSelect({
        orderBy: [{ unknownField: OrderByDirection.AscNullsLast }],
        flatObjectMetadata,
        flatFieldMetadataMaps,
      }),
    ).toEqual({});

    expect(
      buildOrderByColumnsToSelect({
        orderBy: undefined,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      }),
    ).toEqual({});
  });
});
