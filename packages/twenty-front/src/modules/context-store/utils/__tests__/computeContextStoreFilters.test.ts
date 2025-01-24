import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { expect } from '@storybook/test';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('computeContextStoreFilters', () => {
  const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  )!;

  const mockFilterValueDependencies: RecordFilterValueDependencies = {
    currentWorkspaceMemberId: '32219445-f587-4c40-b2b1-6d3205ed96da',
  };

  it('should work for selection mode', () => {
    const contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule = {
      mode: 'selection',
      selectedRecordIds: ['1', '2', '3'],
    };

    const filters = computeContextStoreFilters(
      contextStoreTargetedRecordsRule,
      [],
      personObjectMetadataItem,
      mockFilterValueDependencies,
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

    const contextStoreFilters: RecordFilter[] = [
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
      mockFilterValueDependencies,
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
