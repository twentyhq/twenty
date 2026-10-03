import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeFieldIdsToSelect } from 'src/engine/api/common/common-select-fields/utils/compute-field-ids-to-select.util';

type ComputeFieldIdsToSelectArgs = Parameters<
  typeof computeFieldIdsToSelect
>[0];

type TestFlatObjectMetadata = ComputeFieldIdsToSelectArgs['flatObjectMetadata'];

type TestFlatFieldMetadata =
  ComputeFieldIdsToSelectArgs['readableFlatFields'][number];

const STANDARD_APPLICATION_ID = 'standard-application-id';
const CUSTOM_APPLICATION_ID = 'custom-application-id';

const createField = ({
  name,
  applicationId = STANDARD_APPLICATION_ID,
  type = FieldMetadataType.TEXT,
  relationType,
}: {
  name: string;
  applicationId?: string;
  type?: FieldMetadataType;
  relationType?: RelationType;
}): TestFlatFieldMetadata => ({
  id: `${name}-id`,
  applicationId,
  name,
  type,
  settings: relationType ? { relationType } : null,
});

const buildArgs = ({
  fields,
  labelIdentifierFieldName,
  imageIdentifierFieldName,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  depth = 0,
}: {
  fields: TestFlatFieldMetadata[];
  labelIdentifierFieldName?: string;
  imageIdentifierFieldName?: string;
  applicationUniversalIdentifier?: string;
  depth?: ComputeFieldIdsToSelectArgs['depth'];
}): Pick<
  ComputeFieldIdsToSelectArgs,
  'flatObjectMetadata' | 'readableFlatFields' | 'depth'
> => {
  const flatObjectMetadata: TestFlatObjectMetadata = {
    labelIdentifierFieldMetadataId: labelIdentifierFieldName
      ? `${labelIdentifierFieldName}-id`
      : null,
    imageIdentifierFieldMetadataId: imageIdentifierFieldName
      ? `${imageIdentifierFieldName}-id`
      : null,
    applicationId: STANDARD_APPLICATION_ID,
    applicationUniversalIdentifier,
  };

  return { flatObjectMetadata, readableFlatFields: fields, depth };
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

const ONE_TO_MANY_RELATION_FIELDS = [
  createField({
    name: 'activities',
    type: FieldMetadataType.RELATION,
    relationType: RelationType.ONE_TO_MANY,
  }),
  createField({
    name: 'attachments',
    type: FieldMetadataType.MORPH_RELATION,
    relationType: RelationType.ONE_TO_MANY,
  }),
];

describe('computeFieldIdsToSelect', () => {
  it('should not restrict the selection when the object has at most the maximum number of fields', () => {
    expect(
      computeFieldIdsToSelect({
        ...buildArgs({ fields: WIDE_OBJECT_FIELDS }),
        maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length,
      }),
    ).toBeUndefined();
  });

  it('should not restrict the selection when no maximum is given', () => {
    expect(
      computeFieldIdsToSelect(buildArgs({ fields: WIDE_OBJECT_FIELDS })),
    ).toBeUndefined();
  });

  it('should order the capped field set by priority then standard before custom fields', () => {
    const fieldIdsToSelect = computeFieldIdsToSelect({
      ...buildArgs({
        fields: WIDE_OBJECT_FIELDS,
        labelIdentifierFieldName: 'name',
        imageIdentifierFieldName: 'avatarUrl',
      }),
      maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length - 1,
    });

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
    const fieldIdsToSelect = computeFieldIdsToSelect({
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
    const fieldIdsToSelect = computeFieldIdsToSelect({
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

  it('should not let one-to-many relations count or take slots at depth 0', () => {
    const fields = [...WIDE_OBJECT_FIELDS, ...ONE_TO_MANY_RELATION_FIELDS];

    expect(
      computeFieldIdsToSelect({
        ...buildArgs({ fields, depth: 0 }),
        maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length,
      }),
    ).toBeUndefined();

    const fieldIdsToSelect = computeFieldIdsToSelect({
      ...buildArgs({ fields, depth: 0 }),
      maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length - 1,
    });

    expect(fieldIdsToSelect?.size).toBe(WIDE_OBJECT_FIELDS.length - 1);
    expect(fieldIdsToSelect?.has('activities-id')).toBe(false);
    expect(fieldIdsToSelect?.has('attachments-id')).toBe(false);
  });

  it('should count and select one-to-many relations at depth 1', () => {
    const fields = [...WIDE_OBJECT_FIELDS, ...ONE_TO_MANY_RELATION_FIELDS];

    const fieldIdsToSelect = computeFieldIdsToSelect({
      ...buildArgs({ fields, depth: 1 }),
      maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length,
    });

    expect(fieldIdsToSelect?.has('activities-id')).toBe(true);
    expect(fieldIdsToSelect?.has('attachments-id')).toBe(true);
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

    const fieldIdsToSelect = computeFieldIdsToSelect({
      ...buildArgs({ fields }),
      maximumDefaultFieldCount: 200,
    });

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
    ).toEqual(new Set(['id-id', 'zCustom-id', 'name-id']));
  });

  it('should not select requested fields that are not readable', () => {
    expect(
      computeFieldIdsToSelect({
        ...buildArgs({
          fields: WIDE_OBJECT_FIELDS.filter((field) => field.name !== 'name'),
        }),
        requestedFieldNames: ['name', 'position'],
      }),
    ).toEqual(new Set(['id-id', 'position-id']));
  });
});
