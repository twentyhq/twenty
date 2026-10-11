import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRecordFilterTypeAndLabelFromFieldMetadata } from '@/object-record/record-filter/utils/getRecordFilterTypeAndLabelFromFieldMetadata';
import { FieldMetadataType } from 'twenty-shared/types';

const ownerFieldMetadataItem = {
  id: 'owner-field-id',
  name: 'owner',
  label: 'Owner',
  type: FieldMetadataType.MORPH_RELATION,
} as FieldMetadataItem;

const stageFieldMetadataItem = {
  id: 'stage-field-id',
  name: 'stage',
  label: 'Stage',
  type: FieldMetadataType.SELECT,
} as FieldMetadataItem;

const searchVectorFieldMetadataItem = {
  id: 'search-vector-field-id',
  name: 'searchVector',
  label: 'Search vector',
  type: FieldMetadataType.TS_VECTOR,
} as FieldMetadataItem;

const fieldMetadataItems = [
  ownerFieldMetadataItem,
  stageFieldMetadataItem,
  searchVectorFieldMetadataItem,
];

describe('getRecordFilterTypeAndLabelFromFieldMetadata', () => {
  it('should return the relation filter type for a morph relation field', () => {
    expect(
      getRecordFilterTypeAndLabelFromFieldMetadata({
        fieldMetadataId: ownerFieldMetadataItem.id,
        fieldMetadataItems,
      }),
    ).toEqual({ type: 'RELATION', label: 'Owner' });
  });

  it('should use the relation target field for a relation-traversal filter', () => {
    expect(
      getRecordFilterTypeAndLabelFromFieldMetadata({
        fieldMetadataId: ownerFieldMetadataItem.id,
        relationTargetFieldMetadataId: stageFieldMetadataItem.id,
        fieldMetadataItems,
      }),
    ).toEqual({ type: 'SELECT', label: 'Owner → Stage' });
  });

  it('should label the search vector field as Search', () => {
    expect(
      getRecordFilterTypeAndLabelFromFieldMetadata({
        fieldMetadataId: searchVectorFieldMetadataItem.id,
        fieldMetadataItems,
      }),
    ).toEqual({ type: 'TS_VECTOR', label: 'Search' });
  });

  it('should return undefined when the relation target field is unknown', () => {
    expect(
      getRecordFilterTypeAndLabelFromFieldMetadata({
        fieldMetadataId: ownerFieldMetadataItem.id,
        relationTargetFieldMetadataId: 'unknown-field-id',
        fieldMetadataItems,
      }),
    ).toBeUndefined();
  });
});
