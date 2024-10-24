import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
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
      filters: [
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
      ],
      excludedRecordIds: ['1', '2', '3'],
    };

    const filters = computeContextStoreFilters(
      contextStoreTargetedRecordsRule,
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
