import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { computeFieldIdsToSelect } from 'src/engine/api/common/common-select-fields/utils/compute-field-ids-to-select.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

type ComputeFieldIdsToSelectArgs = Parameters<
  typeof computeFieldIdsToSelect
>[0];

type TestFlatObjectMetadata = ComputeFieldIdsToSelectArgs['flatObjectMetadata'];

type TestFlatFieldMetadata = NonNullable<
  ComputeFieldIdsToSelectArgs['flatFieldMetadataMaps']['byUniversalIdentifier'][string]
>;

const WORKSPACE_ID = 'workspace-id';
const STANDARD_APPLICATION_ID = 'standard-application-id';
const CUSTOM_APPLICATION_ID = 'custom-application-id';

const createField = ({
  name,
  applicationId = STANDARD_APPLICATION_ID,
}: {
  name: string;
  applicationId?: string;
}): TestFlatFieldMetadata => ({
  id: `${name}-id`,
  universalIdentifier: `${name}-universal-identifier`,
  applicationId,
  workspaceId: WORKSPACE_ID,
  name,
});

const buildFlatEntityMaps = <TEntity extends SyncableFlatEntity>(
  entities: TEntity[],
): FlatEntityMaps<TEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildArgs = ({
  fields,
  labelIdentifierFieldName,
  imageIdentifierFieldName,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  fields: TestFlatFieldMetadata[];
  labelIdentifierFieldName?: string;
  imageIdentifierFieldName?: string;
  applicationUniversalIdentifier?: string;
}): Pick<
  ComputeFieldIdsToSelectArgs,
  'flatObjectMetadata' | 'flatFieldMetadataMaps' | 'restrictedFields'
> => {
  const flatObjectMetadata: TestFlatObjectMetadata = {
    fieldIds: fields.map((field) => field.id),
    labelIdentifierFieldMetadataId: labelIdentifierFieldName
      ? `${labelIdentifierFieldName}-id`
      : null,
    imageIdentifierFieldMetadataId: imageIdentifierFieldName
      ? `${imageIdentifierFieldName}-id`
      : null,
    applicationId: STANDARD_APPLICATION_ID,
    applicationUniversalIdentifier,
  };

  return {
    flatObjectMetadata,
    flatFieldMetadataMaps: buildFlatEntityMaps(fields),
    restrictedFields: {},
  };
};

const WIDE_OBJECT_FIELDS = [
  createField({ name: 'zCustom', applicationId: CUSTOM_APPLICATION_ID }),
  createField({ name: 'aCustom', applicationId: CUSTOM_APPLICATION_ID }),
  createField({ name: 'position' }),
  createField({ name: 'zStandard' }),
  createField({ name: 'deletedAt' }),
  createField({ name: 'avatarUrl' }),
  createField({ name: 'updatedAt' }),
  createField({ name: 'aStandard' }),
  createField({ name: 'createdAt' }),
  createField({ name: 'name' }),
  createField({ name: 'id' }),
];

describe('computeFieldIdsToSelect', () => {
  it('should not restrict the selection when the object has at most the maximum number of fields', () => {
    expect(
      computeFieldIdsToSelect({
        ...buildArgs({ fields: WIDE_OBJECT_FIELDS }),
        maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length,
      }),
    ).toEqual({ fieldIdsToSelect: undefined, isDefaultFieldSetCapped: false });
  });

  it('should not restrict the selection when no maximum is given', () => {
    expect(
      computeFieldIdsToSelect(buildArgs({ fields: WIDE_OBJECT_FIELDS })),
    ).toEqual({ fieldIdsToSelect: undefined, isDefaultFieldSetCapped: false });
  });

  it('should order the capped field set by priority then standard before custom fields', () => {
    const { fieldIdsToSelect, isDefaultFieldSetCapped } =
      computeFieldIdsToSelect({
        ...buildArgs({
          fields: WIDE_OBJECT_FIELDS,
          labelIdentifierFieldName: 'name',
          imageIdentifierFieldName: 'avatarUrl',
        }),
        maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length - 1,
      });

    expect(isDefaultFieldSetCapped).toBe(true);
    expect([...(fieldIdsToSelect ?? [])]).toEqual([
      'id-id',
      'name-id',
      'avatarUrl-id',
      'createdAt-id',
      'updatedAt-id',
      'deletedAt-id',
      'position-id',
      'aStandard-id',
      'zStandard-id',
      'aCustom-id',
    ]);
  });

  it('should drop custom fields first when capping', () => {
    const { fieldIdsToSelect } = computeFieldIdsToSelect({
      ...buildArgs({ fields: WIDE_OBJECT_FIELDS }),
      maximumDefaultFieldCount: 7,
    });

    expect(fieldIdsToSelect).toEqual(
      new Set([
        'id-id',
        'createdAt-id',
        'updatedAt-id',
        'deletedAt-id',
        'position-id',
        'aStandard-id',
        'avatarUrl-id',
      ]),
    );
  });

  it('should treat every field as custom on a custom object', () => {
    const { fieldIdsToSelect } = computeFieldIdsToSelect({
      ...buildArgs({
        fields: WIDE_OBJECT_FIELDS,
        applicationUniversalIdentifier: 'custom-application-universal-id',
      }),
      maximumDefaultFieldCount: 6,
    });

    expect([...(fieldIdsToSelect ?? [])]).toEqual([
      'id-id',
      'createdAt-id',
      'updatedAt-id',
      'deletedAt-id',
      'position-id',
      'aCustom-id',
    ]);
  });

  it('should ignore unreadable fields when counting and capping', () => {
    const args = buildArgs({ fields: WIDE_OBJECT_FIELDS });

    expect(
      computeFieldIdsToSelect({
        ...args,
        restrictedFields: { 'zCustom-id': { canRead: false } },
        maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length - 1,
      }),
    ).toEqual({ fieldIdsToSelect: undefined, isDefaultFieldSetCapped: false });

    const { fieldIdsToSelect } = computeFieldIdsToSelect({
      ...args,
      restrictedFields: { 'createdAt-id': { canRead: false } },
      maximumDefaultFieldCount: 3,
    });

    expect([...(fieldIdsToSelect ?? [])]).toEqual([
      'id-id',
      'updatedAt-id',
      'deletedAt-id',
    ]);
  });

  it('should cap an object wider than the maximum to exactly the maximum', () => {
    const fields = [
      createField({ name: 'id' }),
      ...Array.from({ length: 250 }, (_, index) =>
        createField({
          name: `customField${String(index).padStart(3, '0')}`,
          applicationId: CUSTOM_APPLICATION_ID,
        }),
      ),
    ];

    const { fieldIdsToSelect, isDefaultFieldSetCapped } =
      computeFieldIdsToSelect({
        ...buildArgs({ fields }),
        maximumDefaultFieldCount: 200,
      });

    expect(isDefaultFieldSetCapped).toBe(true);
    expect(fieldIdsToSelect?.size).toBe(200);
    expect(fieldIdsToSelect?.has('id-id')).toBe(true);
    expect(fieldIdsToSelect?.has('customField198-id')).toBe(true);
    expect(fieldIdsToSelect?.has('customField199-id')).toBe(false);
  });

  it('should select requested fields plus id and bypass the cap', () => {
    expect(
      computeFieldIdsToSelect({
        ...buildArgs({ fields: WIDE_OBJECT_FIELDS }),
        requestedFieldNames: ['zCustom', 'name'],
        maximumDefaultFieldCount: 1,
      }),
    ).toEqual({
      fieldIdsToSelect: new Set(['id-id', 'zCustom-id', 'name-id']),
      isDefaultFieldSetCapped: false,
    });
  });

  it('should not select requested fields that are not readable', () => {
    expect(
      computeFieldIdsToSelect({
        ...buildArgs({ fields: WIDE_OBJECT_FIELDS }),
        restrictedFields: { 'name-id': { canRead: false } },
        requestedFieldNames: ['name', 'position'],
      }),
    ).toEqual({
      fieldIdsToSelect: new Set(['id-id', 'position-id']),
      isDefaultFieldSetCapped: false,
    });
  });
});
