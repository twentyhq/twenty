import { getKanbanMainGroupByFieldMetadataId } from '@/views/utils/getKanbanMainGroupByFieldMetadataId';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getKanbanMainGroupByFieldMetadataId', () => {
  const companyField = { id: 'company', type: FieldMetadataType.RELATION };
  const stageField = { id: 'stage', type: FieldMetadataType.SELECT };
  const priorityField = { id: 'priority', type: FieldMetadataType.SELECT };

  it('should keep the current grouping field when it can still group records', () => {
    expect(
      getKanbanMainGroupByFieldMetadataId({
        availableFieldsForGrouping: [companyField, stageField, priorityField],
        currentMainGroupByFieldMetadataId: 'priority',
      }),
    ).toBe('priority');
  });

  it('should prefer a select field over a relation listed before it', () => {
    expect(
      getKanbanMainGroupByFieldMetadataId({
        availableFieldsForGrouping: [companyField, stageField],
        currentMainGroupByFieldMetadataId: null,
      }),
    ).toBe('stage');
  });

  it('should ignore a current grouping field that can no longer group records', () => {
    expect(
      getKanbanMainGroupByFieldMetadataId({
        availableFieldsForGrouping: [companyField, stageField],
        currentMainGroupByFieldMetadataId: 'deleted-field',
      }),
    ).toBe('stage');
  });

  it('should fall back to the first field when no select field exists', () => {
    expect(
      getKanbanMainGroupByFieldMetadataId({
        availableFieldsForGrouping: [companyField],
      }),
    ).toBe('company');
  });

  it('should return undefined when no field can group records', () => {
    expect(
      getKanbanMainGroupByFieldMetadataId({ availableFieldsForGrouping: [] }),
    ).toBeUndefined();
  });
});
