import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMultiSelectMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const multiSelectFieldDefinition: FieldDefinition<FieldMultiSelectMetadata> = {
  fieldMetadataId: 'fieldMetadataId',
  label: 'Tags',
  iconName: 'IconTags',
  type: FieldMetadataType.MULTI_SELECT,
  defaultValue: null,
  metadata: {
    fieldName: 'tags',
    options: [
      {
        label: 'Option 1',
        color: 'blue',
        value: 'option-1',
      },
    ],
  },
};

describe('computeDraftValueFromFieldValue', () => {
  it('should keep valid multi select values', () => {
    expect(
      computeDraftValueFromFieldValue({
        fieldDefinition: multiSelectFieldDefinition,
        fieldValue: ['option-1'],
      }),
    ).toEqual(['option-1']);
  });

  it('should reset invalid scalar multi select values to null', () => {
    expect(
      computeDraftValueFromFieldValue({
        fieldDefinition: multiSelectFieldDefinition,
        fieldValue: 'option-1',
      }),
    ).toBeNull();
  });
});
