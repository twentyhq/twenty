import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { computeDefaultFieldNamesToSelect } from 'src/engine/api/common/common-select-fields/utils/compute-default-field-names-to-select.util';

type ComputeDefaultFieldNamesToSelectArgs = Parameters<
  typeof computeDefaultFieldNamesToSelect
>[0];

type TestFlatObjectMetadata =
  ComputeDefaultFieldNamesToSelectArgs['flatObjectMetadata'];

type TestFlatFieldMetadata =
  ComputeDefaultFieldNamesToSelectArgs['readableFlatFields'][number];

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
  applicationId,
  name,
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
  ComputeDefaultFieldNamesToSelectArgs,
  'flatObjectMetadata' | 'readableFlatFields'
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

  return { flatObjectMetadata, readableFlatFields: fields };
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

describe('computeDefaultFieldNamesToSelect', () => {
  it('should not restrict the selection when the object has at most the maximum number of fields', () => {
    expect(
      computeDefaultFieldNamesToSelect({
        ...buildArgs({ fields: WIDE_OBJECT_FIELDS }),
        maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length,
      }),
    ).toEqual(new Set(WIDE_OBJECT_FIELDS.map((field) => field.name)));
  });

  it('should order the capped field set by priority then standard before custom fields', () => {
    const fieldNamesToSelect = computeDefaultFieldNamesToSelect({
      ...buildArgs({
        fields: WIDE_OBJECT_FIELDS,
        labelIdentifierFieldName: 'name',
        imageIdentifierFieldName: 'avatarUrl',
      }),
      maximumDefaultFieldCount: WIDE_OBJECT_FIELDS.length - 1,
    });

    expect([...fieldNamesToSelect]).toEqual([
      'id',
      'name',
      'avatarUrl',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'position',
      'aStandard',
      'zStandard',
      'aCustom',
    ]);
  });

  it('should treat every field as custom on a custom object', () => {
    const fieldNamesToSelect = computeDefaultFieldNamesToSelect({
      ...buildArgs({
        fields: WIDE_OBJECT_FIELDS,
        applicationUniversalIdentifier: 'custom-application-universal-id',
      }),
      maximumDefaultFieldCount: 6,
    });

    expect([...fieldNamesToSelect]).toEqual([
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'position',
      'aCustom',
    ]);
  });

  it('keeps identifier priority when the identifier is also a system field', () => {
    const selection = computeDefaultFieldNamesToSelect({
      ...buildArgs({
        fields: WIDE_OBJECT_FIELDS,
        labelIdentifierFieldName: 'position',
        imageIdentifierFieldName: 'position',
      }),
      maximumDefaultFieldCount: 3,
    });

    expect([...selection]).toEqual(['id', 'position', 'createdAt']);
  });
});
