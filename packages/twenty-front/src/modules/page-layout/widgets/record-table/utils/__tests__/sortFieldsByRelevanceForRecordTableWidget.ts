import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { sortFieldsByRelevanceForRecordTableWidget } from '@/page-layout/widgets/record-table/utils/sortFieldsByRelevanceForRecordTableWidget';

const labelIdentifierFieldMetadataId = 'label-identifier-id';

const labelIdentifierField: Pick<
  FieldMetadataItem,
  'id' | 'type' | 'settings'
> = {
  id: labelIdentifierFieldMetadataId,
  type: FieldMetadataType.TEXT,
  settings: null,
};

const regularTextField: Pick<FieldMetadataItem, 'id' | 'type' | 'settings'> = {
  id: 'regular-text-field-id',
  type: FieldMetadataType.TEXT,
  settings: null,
};

const anotherRegularTextField: Pick<
  FieldMetadataItem,
  'id' | 'type' | 'settings'
> = {
  id: 'another-regular-text-field-id',
  type: FieldMetadataType.TEXT,
  settings: null,
};

const oneToManyRelationField: Pick<
  FieldMetadataItem,
  'id' | 'type' | 'settings'
> = {
  id: 'one-to-many-relation-field-id',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.ONE_TO_MANY },
};

const manyToOneRelationField: Pick<
  FieldMetadataItem,
  'id' | 'type' | 'settings'
> = {
  id: 'many-to-one-relation-field-id',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
};

const anotherManyToOneRelationField: Pick<
  FieldMetadataItem,
  'id' | 'type' | 'settings'
> = {
  id: 'another-many-to-one-relation-field-id',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
};

describe('sortFieldsByRelevanceForWidget', () => {
  it('returns -1 when fieldA is the label identifier field', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      labelIdentifierField as FieldMetadataItem,
      regularTextField as FieldMetadataItem,
    );

    expect(result).toBe(-1);
  });

  it('returns 1 when fieldB is the label identifier field', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      regularTextField as FieldMetadataItem,
      labelIdentifierField as FieldMetadataItem,
    );

    expect(result).toBe(1);
  });

  it('returns 1 when fieldA is a ONE_TO_MANY relation and fieldB is not', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      oneToManyRelationField as FieldMetadataItem,
      regularTextField as FieldMetadataItem,
    );

    expect(result).toBe(1);
  });

  it('returns -1 when fieldB is a ONE_TO_MANY relation and fieldA is not', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      regularTextField as FieldMetadataItem,
      oneToManyRelationField as FieldMetadataItem,
    );

    expect(result).toBe(-1);
  });

  it('returns 1 when fieldA is a non-ONE_TO_MANY relation and fieldB is a non-relation field', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      manyToOneRelationField as FieldMetadataItem,
      regularTextField as FieldMetadataItem,
    );

    expect(result).toBe(1);
  });

  it('returns -1 when fieldB is a non-ONE_TO_MANY relation and fieldA is a non-relation field', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      regularTextField as FieldMetadataItem,
      manyToOneRelationField as FieldMetadataItem,
    );

    expect(result).toBe(-1);
  });

  it('returns 0 when both fields are non-relation non-label-identifier fields', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      regularTextField as FieldMetadataItem,
      anotherRegularTextField as FieldMetadataItem,
    );

    expect(result).toBe(0);
  });

  it('returns 0 when both fields are non-ONE_TO_MANY relation fields', () => {
    const comparator = sortFieldsByRelevanceForRecordTableWidget(
      labelIdentifierFieldMetadataId,
    );

    const result = comparator(
      manyToOneRelationField as FieldMetadataItem,
      anotherManyToOneRelationField as FieldMetadataItem,
    );

    expect(result).toBe(0);
  });
});
