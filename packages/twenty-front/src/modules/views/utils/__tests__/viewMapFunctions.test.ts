import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ViewField } from '@/views/types/ViewField';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { ViewFilterOperand } from 'twenty-shared/types';

import { FieldMetadataType } from '~/generated-metadata/graphql';

const baseFieldMetadataItem = {
  id: '05731f68-6e7a-4903-8374-c0b6a9063482',
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01',
  name: 'name',
  label: 'Name',
  type: FieldMetadataType.FULL_NAME,
};

describe('mapViewFiltersToFilters', () => {
  it('should map each ViewFilter object to a corresponding Filter object', () => {
    const viewFilters: ViewFilter[] = [
      {
        __typename: 'ViewFilter',
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.IS,
      },
    ];

    const expectedFilters: RecordFilter[] = [
      {
        id: 'id',
        fieldMetadataId: '05731f68-6e7a-4903-8374-c0b6a9063482',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.IS,
        label: baseFieldMetadataItem.label,
        type: FieldMetadataType.FULL_NAME,
        positionInRecordFilterGroup: undefined,
        recordFilterGroupId: undefined,
      },
    ];
    expect(
      mapViewFiltersToFilters(viewFilters, [baseFieldMetadataItem]),
    ).toEqual(expectedFilters);
  });
});

describe('mapViewFieldsToColumnDefinitions', () => {
  it('should map visible ViewFields to ColumnDefinitions and filter out missing fieldMetadata', () => {
    const viewFields: ViewField[] = [
      {
        __typename: 'ViewField',
        id: '1',
        fieldMetadataId: '1',
        position: 1,
        size: 1,
        isVisible: false,
        definition: {
          fieldMetadataId: '1',
          label: 'label 1',
          metadata: { fieldName: 'fieldName 1' },
          iconName: 'iconName 1',
          type: FieldMetadataType.TEXT,
          position: 1,
          size: 1,
          isVisible: false,
          viewFieldId: '1',
        },
      },
      {
        __typename: 'ViewField',
        id: '2',
        fieldMetadataId: '2',
        position: 2,
        size: 2,
        isVisible: false,
        definition: {
          fieldMetadataId: '2',
          label: 'label 2',
          metadata: { fieldName: 'fieldName 2' },
          iconName: 'iconName 2',
          type: FieldMetadataType.TEXT,
          position: 2,
          size: 1,
          isVisible: false,
          viewFieldId: '2',
        },
      },
      {
        __typename: 'ViewField',
        id: '3',
        fieldMetadataId: '3',
        position: 3,
        size: 3,
        isVisible: true,
        definition: {
          fieldMetadataId: '3',
          label: 'label 3',
          metadata: { fieldName: 'fieldName 3' },
          iconName: 'iconName 3',
          type: FieldMetadataType.TEXT,
          position: 3,
          size: 1,
          isVisible: false,
          viewFieldId: '3',
        },
      },
    ];

    const columnDefinitions: ColumnDefinition<FieldMetadata>[] = [
      {
        fieldMetadataId: '1',
        label: 'label 1',
        position: 1,
        metadata: { fieldName: 'fieldName 1' },
        iconName: 'iconName 1',
        type: FieldMetadataType.TEXT,
        size: 1,
      },
      {
        fieldMetadataId: '3',
        label: 'label 3',
        position: 3,
        metadata: { fieldName: 'fieldName 3' },
        iconName: 'iconName 3',
        type: FieldMetadataType.TEXT,
        size: 3,
      },
    ];

    const expectedColumnDefinitions: ColumnDefinition<FieldMetadata>[] = [
      {
        fieldMetadataId: '1',
        label: 'label 1',
        metadata: { fieldName: 'fieldName 1' },
        iconName: 'iconName 1',
        type: FieldMetadataType.TEXT,
        size: 1,
        position: 1,
        isVisible: false,
        viewFieldId: '1',
      },
      {
        fieldMetadataId: '3',
        label: 'label 3',
        metadata: { fieldName: 'fieldName 3' },
        iconName: 'iconName 3',
        type: FieldMetadataType.TEXT,
        size: 3,
        position: 3,
        isVisible: true,
        viewFieldId: '3',
      },
    ];

    const actualColumnDefinitions = mapViewFieldsToColumnDefinitions({
      columnDefinitions,
      viewFields,
    });

    expect(actualColumnDefinitions).toEqual(expectedColumnDefinitions);
  });
});

describe('mapColumnDefinitionsToViewFields', () => {
  it('should map ColumnDefinitions to ViewFields, setting defaults and using viewFieldId if present', () => {
    const columnDefinitions = [
      {
        fieldMetadataId: 1,
        position: 1,
        isVisible: true,
        viewFieldId: 'custom-id-1',
      },
      {
        fieldMetadataId: 2,
        position: 2,
        size: 200,
        isVisible: false,
      },
    ];

    const expectedViewFields = [
      {
        __typename: 'ViewField',
        id: 'custom-id-1',
        fieldMetadataId: 1,
        position: 1,
        isVisible: true,
        definition: columnDefinitions[0],
        size: undefined,
      },
      {
        __typename: 'ViewField',
        id: '',
        fieldMetadataId: 2,
        position: 2,
        size: 200,
        isVisible: false,
        definition: columnDefinitions[1],
      },
    ];

    const actualViewFields = mapColumnDefinitionsToViewFields(
      columnDefinitions as unknown as ColumnDefinition<FieldMetadata>[],
    );

    expect(actualViewFields).toEqual(expectedViewFields);
  });
});
