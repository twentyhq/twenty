import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';

import { updateDataIsSupportedByOrmV2 } from 'src/engine/api/common/common-query-runners/utils/update-data-is-supported-by-orm-v2.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';

jest.mock(
  'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util',
);
jest.mock(
  'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util',
);

const fieldTypeById: Record<string, FieldMetadataType> = {
  'field-jobTitle': FieldMetadataType.TEXT,
  'field-name': FieldMetadataType.FULL_NAME,
  'field-company': FieldMetadataType.RELATION,
  'field-owner': FieldMetadataType.MORPH_RELATION,
  'field-attachments': FieldMetadataType.FILES,
};

beforeEach(() => {
  jest.mocked(buildFieldMapsFromFlatObjectMetadata).mockReturnValue({
    fieldIdByName: {
      jobTitle: 'field-jobTitle',
      name: 'field-name',
      company: 'field-company',
      owner: 'field-owner',
      attachments: 'field-attachments',
    },
    fieldIdByJoinColumnName: { companyId: 'field-company' },
  });

  jest
    .mocked(findFlatEntityByIdInFlatEntityMaps)
    .mockImplementation(({ flatEntityId }) =>
      flatEntityId !== undefined && flatEntityId in fieldTypeById
        ? ({ type: fieldTypeById[flatEntityId] } as never)
        : undefined,
    );
});

const callWith = (data: Partial<ObjectRecord>) =>
  updateDataIsSupportedByOrmV2({
    data,
    flatObjectMetadata: {} as never,
    flatFieldMetadataMaps: {} as never,
  });

describe('updateDataIsSupportedByOrmV2', () => {
  it('should return true for empty data', () => {
    expect(callWith({})).toBe(true);
  });

  it('should return true for scalar and composite fields', () => {
    expect(callWith({ jobTitle: 'Tech Lead', name: { firstName: 'A' } })).toBe(
      true,
    );
  });

  it('should return false when a relation field is set', () => {
    expect(callWith({ company: { connect: { where: { id: 'x' } } } })).toBe(
      false,
    );
  });

  it('should return false when a morph relation field is set', () => {
    expect(callWith({ owner: { connect: { where: { id: 'x' } } } })).toBe(
      false,
    );
  });

  it('should return false when a files field is set', () => {
    expect(callWith({ attachments: [] })).toBe(false);
  });

  it('should resolve a relation set through its join column name', () => {
    expect(callWith({ companyId: 'company-id' })).toBe(false);
  });

  it('should return false for an unknown field', () => {
    expect(callWith({ doesNotExist: 'x' })).toBe(false);
  });
});
