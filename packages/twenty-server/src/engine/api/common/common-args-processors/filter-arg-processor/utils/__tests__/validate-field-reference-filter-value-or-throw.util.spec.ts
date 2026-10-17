import { FieldMetadataType } from 'twenty-shared/types';

import { validateFieldReferenceFilterValueOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-field-reference-filter-value-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const createField = (
  name: string,
  type: FieldMetadataType,
): FlatFieldMetadata =>
  ({
    id: `${name}-id`,
    name,
    type,
    universalIdentifier: `${name}-universal-id`,
  }) as FlatFieldMetadata;

const archivedAtField = createField('archivedAt', FieldMetadataType.DATE_TIME);
const lastReadAtField = createField('lastReadAt', FieldMetadataType.DATE_TIME);
const titleField = createField('title', FieldMetadataType.TEXT);
const lastActivityAtField = createField(
  'lastActivityAt',
  FieldMetadataType.DATE_TIME,
);
const messageCountField = createField('messageCount', FieldMetadataType.NUMBER);

const participantObjectMetadata = {
  id: 'participant-id',
  nameSingular: 'participant',
  fieldIds: [archivedAtField.id, lastReadAtField.id],
} as FlatObjectMetadata;

const threadObjectMetadata = {
  id: 'thread-id',
  nameSingular: 'thread',
  fieldIds: [titleField.id, lastActivityAtField.id, messageCountField.id],
} as FlatObjectMetadata;

const allFields = [
  archivedAtField,
  lastReadAtField,
  titleField,
  lastActivityAtField,
  messageCountField,
];

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    allFields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    allFields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
};

const validate = ({
  operator,
  value,
  isInsideRelationFilter = true,
}: {
  operator: Parameters<
    typeof validateFieldReferenceFilterValueOrThrow
  >[0]['operator'];
  value: unknown;
  isInsideRelationFilter?: boolean;
}) =>
  validateFieldReferenceFilterValueOrThrow({
    operator,
    value,
    fieldMetadata: archivedAtField,
    fieldName: 'archivedAt',
    flatObjectMetadata: participantObjectMetadata,
    parentFlatObjectMetadata: isInsideRelationFilter
      ? threadObjectMetadata
      : undefined,
    flatFieldMetadataMaps,
  });

describe('validateFieldReferenceFilterValueOrThrow', () => {
  it('accepts a field of the same object', () => {
    expect(validate({ operator: 'gtField', value: 'lastReadAt' })).toBe(
      'lastReadAt',
    );
  });

  it('accepts a field of the object the relation filter starts from', () => {
    expect(
      validate({ operator: 'ltParentField', value: 'lastActivityAt' }),
    ).toBe('lastActivityAt');
  });

  it('rejects a parent reference outside a relation filter', () => {
    expect(() =>
      validate({
        operator: 'ltParentField',
        value: 'lastActivityAt',
        isInsideRelationFilter: false,
      }),
    ).toThrow('can only be used inside a relation filter');
  });

  it('looks the field up on the object the operator points to', () => {
    expect(() =>
      validate({ operator: 'gtField', value: 'lastActivityAt' }),
    ).toThrow(CommonQueryRunnerException);
  });

  it.each([
    ['a missing value', undefined],
    ['an empty name', ''],
    ['a non string value', 42],
  ])('rejects %s', (_, value) => {
    expect(() => validate({ operator: 'gtField', value })).toThrow(
      CommonQueryRunnerException,
    );
  });

  it.each([
    ['a text field', 'title'],
    ['a number field', 'messageCount'],
  ])('rejects comparing a date with %s', (_, value) => {
    expect(() => validate({ operator: 'gtParentField', value })).toThrow(
      'Cannot compare field',
    );
  });
});
