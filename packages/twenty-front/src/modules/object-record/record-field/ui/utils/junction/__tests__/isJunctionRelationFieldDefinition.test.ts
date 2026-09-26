import {
  relationFieldDefinition,
  textfieldDefinition,
} from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isJunctionRelationFieldDefinition } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationFieldDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const junctionRelationFieldDefinition: FieldDefinition<FieldRelationMetadata> =
  {
    fieldMetadataId: 'field-metadata-id',
    label: 'Tags',
    iconName: 'IconTag',
    type: FieldMetadataType.RELATION,
    metadata: {
      fieldName: 'tags',
      objectMetadataNameSingular: 'person',
      relationFieldMetadataId: 'relation-field-metadata-id',
      relationObjectMetadataId: 'junction-object-metadata-id',
      relationObjectMetadataNameSingular: 'personTag',
      relationObjectMetadataNamePlural: 'personTags',
      settings: { junctionTargetFieldId: 'junction-target-field-id' },
    },
  };

describe('isJunctionRelationFieldDefinition', () => {
  it('should return false for non-relation fields', () => {
    expect(
      isJunctionRelationFieldDefinition({
        fieldDefinition: textfieldDefinition,
        objectMetadataItems,
      }),
    ).toBe(false);
  });

  it('should return false for plain relation fields', () => {
    expect(
      isJunctionRelationFieldDefinition({
        fieldDefinition: relationFieldDefinition,
        objectMetadataItems,
      }),
    ).toBe(false);
  });

  it('should return true for relation fields configured through a junction', () => {
    expect(
      isJunctionRelationFieldDefinition({
        fieldDefinition: junctionRelationFieldDefinition,
        objectMetadataItems,
      }),
    ).toBe(true);
  });
});
