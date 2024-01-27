import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { ViewSort } from '@/views/types/ViewSort';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { mapViewFieldsToBoardFieldDefinitions } from '@/views/utils/mapViewFieldsToBoardFieldDefinitions';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

const baseDefinition = {
  fieldMetadataId: 'fieldMetadataId',
  label: 'label',
  iconName: 'iconName',
};

describe('mapViewSortsToSorts', () => {
  it('should map each ViewSort object to a corresponding Sort object', () => {
    const viewSorts: ViewSort[] = [
      {
        id: 'id',
        fieldMetadataId: 'fieldMetadataId',
        direction: 'asc',
        definition: baseDefinition,
      },
    ];
    const expectedSorts: Sort[] = [
      {
        fieldMetadataId: 'fieldMetadataId',
        direction: 'asc',
        definition: baseDefinition,
      },
    ];
    expect(mapViewSortsToSorts(viewSorts)).toEqual(expectedSorts);
  });
});

describe('mapViewFiltersToFilters', () => {
  it('should map each ViewFilter object to a corresponding Filter object', () => {
    const viewFilters: ViewFilter[] = [
      {
        id: 'id',
        fieldMetadataId: '1',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
        definition: {
          ...baseDefinition,
          type: 'FULL_NAME',
        },
      },
    ];
    const expectedFilters: Filter[] = [
      {
        fieldMetadataId: '1',
        value: 'testValue',
        displayValue: 'Test Display Value',
        operand: ViewFilterOperand.Is,
        definition: {
          ...baseDefinition,
          type: 'FULL_NAME',
        },
      },
    ];
    expect(mapViewFiltersToFilters(viewFilters)).toEqual(expectedFilters);
  });
});

describe('mapViewFieldsToColumnDefinitions', () => {
  it('should map visible ViewFields to ColumnDefinitions and filter out missing fieldMetadata', () => {
    const viewFields: ViewField[] = [
      {
        id: '1',
        fieldMetadataId: '1',
        position: 1,
        size: 1,
        isVisible: false,
        definition: {
          fieldMetadataId: '1',
          label: 'label 1',
          metadata: { fieldName: 'fieldName 1' },
          infoTooltipContent: 'infoTooltipContent 1',
          iconName: 'iconName 1',
          type: 'TEXT',
          position: 1,
          size: 1,
          isVisible: false,
          viewFieldId: '1',
        },
      },
      {
        id: '2',
        fieldMetadataId: '2',
        position: 2,
        size: 2,
        isVisible: false,
        definition: {
          fieldMetadataId: '2',
          label: 'label 2',
          metadata: { fieldName: 'fieldName 2' },
          infoTooltipContent: 'infoTooltipContent 2',
          iconName: 'iconName 2',
          type: 'TEXT',
          position: 2,
          size: 1,
          isVisible: false,
          viewFieldId: '2',
        },
      },
      {
        id: '3',
        fieldMetadataId: '3',
        position: 3,
        size: 3,
        isVisible: true,
        definition: {
          fieldMetadataId: '3',
          label: 'label 3',
          metadata: { fieldName: 'fieldName 3' },
          infoTooltipContent: 'infoTooltipContent 3',
          iconName: 'iconName 3',
          type: 'TEXT',
          position: 3,
          size: 1,
          isVisible: false,
          viewFieldId: '3',
        },
      },
    ];

    const fieldsMetadata: ColumnDefinition<FieldMetadata>[] = [
      {
        fieldMetadataId: '1',
        label: 'label 1',
        position: 1,
        metadata: { fieldName: 'fieldName 1' },
        infoTooltipContent: 'infoTooltipContent 1',
        iconName: 'iconName 1',
        type: 'TEXT',
        size: 1,
      },
      {
        fieldMetadataId: '3',
        label: 'label 3',
        position: 3,
        metadata: { fieldName: 'fieldName 3' },
        infoTooltipContent: 'infoTooltipContent 3',
        iconName: 'iconName 3',
        type: 'TEXT',
        size: 3,
      },
    ];

    const expectedColumnDefinitions: ColumnDefinition<FieldMetadata>[] = [
      {
        fieldMetadataId: '1',
        label: 'label 1',
        metadata: { fieldName: 'fieldName 1' },
        infoTooltipContent: 'infoTooltipContent 1',
        iconName: 'iconName 1',
        type: 'TEXT',
        size: 1,
        position: 1,
        isVisible: false,
        viewFieldId: '1',
      },
      {
        fieldMetadataId: '3',
        label: 'label 3',
        metadata: { fieldName: 'fieldName 3' },
        infoTooltipContent: 'infoTooltipContent 3',
        iconName: 'iconName 3',
        type: 'TEXT',
        size: 3,
        position: 3,
        isVisible: true,
        viewFieldId: '3',
      },
    ];

    const actualColumnDefinitions = mapViewFieldsToColumnDefinitions(
      viewFields,
      fieldsMetadata,
    );

    expect(actualColumnDefinitions).toEqual(expectedColumnDefinitions);
  });
});

describe('mapViewFieldsToBoardFieldDefinitions', () => {
  it('should map visible ViewFields to BoardFieldDefinitions and filter out missing fieldMetadata', () => {
    const viewFields = [
      {
        id: 1,
        fieldMetadataId: 1,
        position: 1,
        isVisible: true,
      },
      {
        id: 2,
        fieldMetadataId: 2,
        position: 2,
        isVisible: false,
      },
      {
        id: 3,
        fieldMetadataId: 3,
        position: 3,
        isVisible: true,
      },
    ];

    const fieldsMetadata = [
      {
        fieldMetadataId: 1,
        label: 'Field 1',
        metadata: {},
        position: 1,
        infoTooltipContent: 'Tooltip content for Field 1',
        iconName: 'icon-field-1',
        type: 'string',
      },
      {
        fieldMetadataId: 3,
        label: 'Field 3',
        metadata: {},
        position: 3,
        infoTooltipContent: 'Tooltip for Field 3',
        iconName: 'icon-field-3',
        type: 'number',
      },
    ];

    const expectedBoardFieldDefinitions = [
      {
        fieldMetadataId: 1,
        label: 'Field 1',
        metadata: {},
        position: 1,
        infoTooltipContent: 'Tooltip content for Field 1',
        iconName: 'icon-field-1',
        type: 'string',
        isVisible: true,
        viewFieldId: 1,
      },
      {
        fieldMetadataId: 3,
        label: 'Field 3',
        metadata: {},
        position: 3,
        infoTooltipContent: 'Tooltip for Field 3',
        iconName: 'icon-field-3',
        type: 'number',
        isVisible: true,
        viewFieldId: 3,
      },
    ];

    const actualBoardFieldDefinitions = mapViewFieldsToBoardFieldDefinitions(
      viewFields as unknown as ViewField[],
      fieldsMetadata as unknown as BoardFieldDefinition<FieldMetadata>[],
    );

    expect(actualBoardFieldDefinitions).toEqual(expectedBoardFieldDefinitions);
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
        id: 'custom-id-1',
        fieldMetadataId: 1,
        position: 1,
        isVisible: true,
        definition: columnDefinitions[0],
      },
      {
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
