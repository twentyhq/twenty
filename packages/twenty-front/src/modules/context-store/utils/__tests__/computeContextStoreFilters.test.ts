import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { expect } from '@storybook/test';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
describe('computeContextStoreFilters', () => {
  const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  )!;

  it('should work for selection mode', () => {
    const contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule = {
      mode: 'selection',
      selectedRecordIds: ['1', '2', '3'],
    };

    const filters = computeContextStoreFilters(
      contextStoreTargetedRecordsRule,
      [],
      personObjectMetadataItem,
    );

    expect(filters).toEqual({
      id: {
        in: ['1', '2', '3'],
      },
    });
  });

  it('should work for exclusion mode', () => {
    const contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule = {
      mode: 'exclusion',

      excludedRecordIds: ['1', '2', '3'],
    };

    const contextStoreFilters: Filter[] = [
      {
        id: 'name-filter',
        variant: 'default',
        fieldMetadataId: personObjectMetadataItem.fields.find(
          (field) => field.name === 'name',
        )!.id,
        value: 'John',
        displayValue: 'John',
        displayAvatarUrl: undefined,
        operand: ViewFilterOperand.Contains,
        definition: {
          fieldMetadataId: personObjectMetadataItem.fields.find(
            (field) => field.name === 'name',
          )!.id,
          label: 'Name',
          iconName: 'person',
          type: 'TEXT',
        },
      },
    ];

    const filters = computeContextStoreFilters(
      contextStoreTargetedRecordsRule,
      contextStoreFilters,
      personObjectMetadataItem,
    );

    expect(filters).toEqual({
      and: [
        {
          name: {
            ilike: '%John%',
          },
        },
        {
          not: {
            id: {
              in: ['1', '2', '3'],
            },
          },
        },
      ],
    });
  });
});
