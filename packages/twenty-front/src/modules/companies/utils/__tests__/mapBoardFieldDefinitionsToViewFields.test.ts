import { mapBoardFieldDefinitionsToViewFields } from '@/companies/utils/mapBoardFieldDefinitionsToViewFields';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';

describe('mapBoardFieldDefinitionsToViewFields', () => {
  it('should map board field definitions to view fields', () => {
    const fieldDefinitions: BoardFieldDefinition<FieldMetadata>[] = [
      {
        fieldMetadataId: 'fieldMetadataId',
        label: 'label',
        iconName: 'iconName',
        type: 'BOOLEAN',
        metadata: {
          objectMetadataNameSingular: 'objectMetadataNameSingular',
          fieldName: 'fieldName',
        },
        position: 0,
        isVisible: true,
        viewFieldId: 'viewFieldId',
      },
      {
        fieldMetadataId: 'fieldMetadataId1',
        label: 'label1',
        iconName: 'iconName1',
        type: 'NUMBER',
        metadata: {
          objectMetadataNameSingular: 'objectMetadataNameSingular1',
          fieldName: 'fieldName1',
          placeHolder: 'placeHolder1',
          isPositive: true,
        },
        position: 1,
        isVisible: false,
        viewFieldId: 'viewFieldId1',
      },
    ];
    const viewFields = mapBoardFieldDefinitionsToViewFields(fieldDefinitions);

    expect(viewFields).toHaveLength(2);

    expect(viewFields[0]).toHaveProperty('id');
    expect(viewFields[0]).toHaveProperty('size');
    expect(viewFields[0]).toHaveProperty('position');
    expect(viewFields[0]).toHaveProperty('isVisible');

    expect(viewFields[0].definition).toEqual(fieldDefinitions[0]);
    expect(viewFields[1].definition).toEqual(fieldDefinitions[1]);
  });
});
