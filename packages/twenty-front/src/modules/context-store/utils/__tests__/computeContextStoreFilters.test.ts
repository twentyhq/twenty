import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  type RecordFilterValueDependencies,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

describe('computeContextStoreFilters', () => {
  const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  )!;

  const mockFilterValueDependencies: RecordFilterValueDependencies = {
    currentWorkspaceMemberId: '32219445-f587-4c40-b2b1-6d3205ed96da',
    timeZone: 'Europe/Paris',
  };

  it('should work for selection mode', () => {
    const contextStoreTargetedRecordsRule: ContextStoreTargetedRecordsRule = {
      mode: 'selection',
      selectedRecordIds: ['1', '2', '3'],
    };

    const filters = computeContextStoreFilters({
      contextStoreTargetedRecordsRule,
      contextStoreFilters: [],
      contextStoreFilterGroups: [],
      objectMetadataItem: personObjectMetadataItem,
      filterValueDependencies: mockFilterValueDependencies,
      contextStoreAnyFieldFilterValue: '',
    });

    expect(filters).toEqual({
      and: [
        {},
        {
          id: {
            in: ['1', '2', '3'],
          },
        },
        {},
      ],
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
        fieldMetadataId: personObjectMetadataItem.fields.find(
          (field) => field.name === 'name',
        )!.id,
        value: 'John',
        displayValue: 'John',
        displayAvatarUrl: undefined,
        operand: ViewFilterOperand.CONTAINS,
        type: 'TEXT',
        label: 'Name',
      },
    ];

    const filters = computeContextStoreFilters({
      contextStoreTargetedRecordsRule,
      contextStoreFilters,
      contextStoreFilterGroups: [],
      objectMetadataItem: personObjectMetadataItem,
      filterValueDependencies: mockFilterValueDependencies,
      contextStoreAnyFieldFilterValue: '',
    });

    expect(filters).toEqual({
      and: [
        {},
        {
          or: [
            {
              name: {
                firstName: {
                  ilike: '%John%',
                },
              },
            },
            {
              name: {
                lastName: {
                  ilike: '%John%',
                },
              },
            },
          ],
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
