import { FieldMetadataType } from 'twenty-shared/types';

import { buildDuplicateSourceColumnsToSelect } from 'src/engine/api/common/common-query-runners/utils/build-duplicate-source-columns-to-select.util';
import { computeDefaultFieldNamesToSelect } from 'src/engine/api/common/metadata-selection/utils/compute-default-field-names-to-select.util';
import { REST_API_DEFAULT_MAX_FIELDS } from 'src/engine/api/rest/input-request-parsers/constants/rest-api-default-max-fields.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const createField = (name: string, type = FieldMetadataType.TEXT) =>
  getFlatFieldMetadataMock({
    id: `${name}-id`,
    objectMetadataId: 'object-id',
    universalIdentifier: `${name}-id`,
    name,
    type,
  });

const buildArgs = (fields: ReturnType<typeof createField>[]) => ({
  flatObjectMetadata: getFlatObjectMetadataMock({
    universalIdentifier: 'object-id',
    fieldIds: fields.map((field) => field.id),
    duplicateCriteria: [
      ['nameFirstName', 'nameLastName'],
      ['emailsPrimaryEmail'],
    ],
  }),
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.universalIdentifier, field]),
    ),
    universalIdentifierById: Object.fromEntries(
      fields.map((field) => [field.id, field.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  },
  restrictedFields: {},
});

const FIELDS = [
  createField('id', FieldMetadataType.UUID),
  createField('name', FieldMetadataType.FULL_NAME),
  createField('emails', FieldMetadataType.EMAILS),
  createField('jobTitle'),
];

describe('buildDuplicateSourceColumnsToSelect', () => {
  it('loads only id and matching columns, including composite criteria', () => {
    expect(buildDuplicateSourceColumnsToSelect(buildArgs(FIELDS))).toEqual({
      id: true,
      nameFirstName: true,
      nameLastName: true,
      emailsPrimaryEmail: true,
    });
  });

  it('does not load unreadable matching fields', () => {
    expect(
      buildDuplicateSourceColumnsToSelect({
        ...buildArgs(FIELDS),
        restrictedFields: { 'name-id': { canRead: false } },
      }),
    ).toEqual({ id: true, emailsPrimaryEmail: true });
  });

  it('keeps matching columns excluded by the default response cap', () => {
    const fields = [
      createField('id', FieldMetadataType.UUID),
      ...Array.from({ length: REST_API_DEFAULT_MAX_FIELDS }, (_, index) =>
        createField(`custom${index}`),
      ),
      createField('zDuplicateKey'),
    ];
    const args = buildArgs(fields);

    args.flatObjectMetadata.duplicateCriteria = [['zDuplicateKey']];

    const responseFieldNames = computeDefaultFieldNamesToSelect({
      flatObjectMetadata: args.flatObjectMetadata,
      readableFlatFields: fields,
      depth: 0,
      maximumDefaultFieldCount: REST_API_DEFAULT_MAX_FIELDS,
    });

    expect(responseFieldNames?.has('zDuplicateKey')).toBe(false);
    expect(buildDuplicateSourceColumnsToSelect(args)).toEqual({
      id: true,
      zDuplicateKey: true,
    });
  });

  it('loads only id when no duplicate criteria exist', () => {
    const args = buildArgs(FIELDS);

    args.flatObjectMetadata.duplicateCriteria = null;

    expect(buildDuplicateSourceColumnsToSelect(args)).toEqual({ id: true });
  });
});
