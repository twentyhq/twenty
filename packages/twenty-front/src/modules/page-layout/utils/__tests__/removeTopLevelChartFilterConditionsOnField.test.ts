import { removeTopLevelChartFilterConditionsOnField } from '@/page-layout/utils/removeTopLevelChartFilterConditionsOnField';

const CLOSE_DATE_FIELD_ID = 'close-date-field-id';
const STAGE_FIELD_ID = 'stage-field-id';

const closeDateCondition = {
  id: 'close-date-condition',
  fieldMetadataId: CLOSE_DATE_FIELD_ID,
  operand: 'IS_RELATIVE',
  value: 'PAST_30_DAY',
};

const stageCondition = {
  id: 'stage-condition',
  fieldMetadataId: STAGE_FIELD_ID,
  operand: 'IS',
  value: '["WON"]',
};

describe('removeTopLevelChartFilterConditionsOnField', () => {
  it('should remove ungrouped conditions on the field and keep the others', () => {
    expect(
      removeTopLevelChartFilterConditionsOnField({
        filter: { recordFilters: [closeDateCondition, stageCondition] },
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
      }),
    ).toEqual({ recordFilters: [stageCondition], recordFilterGroups: [] });
  });

  it('should remove every condition on the field in the root AND group', () => {
    const rootGroup = { id: 'root', logicalOperator: 'AND' };

    expect(
      removeTopLevelChartFilterConditionsOnField({
        filter: {
          recordFilters: [
            { ...closeDateCondition, recordFilterGroupId: 'root' },
            {
              ...closeDateCondition,
              id: 'second-close-date-condition',
              recordFilterGroupId: 'root',
            },
            { ...stageCondition, recordFilterGroupId: 'root' },
          ],
          recordFilterGroups: [rootGroup],
        },
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
      }),
    ).toEqual({
      recordFilters: [{ ...stageCondition, recordFilterGroupId: 'root' }],
      recordFilterGroups: [rootGroup],
    });
  });

  it('should drop a root AND group left empty', () => {
    expect(
      removeTopLevelChartFilterConditionsOnField({
        filter: {
          recordFilters: [
            { ...closeDateCondition, recordFilterGroupId: 'root' },
          ],
          recordFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
        },
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
      }),
    ).toEqual({ recordFilters: [], recordFilterGroups: [] });
  });

  it('should refuse when a condition on the field sits in an OR group', () => {
    expect(
      removeTopLevelChartFilterConditionsOnField({
        filter: {
          recordFilters: [
            closeDateCondition,
            {
              ...closeDateCondition,
              id: 'or-close-date-condition',
              recordFilterGroupId: 'root',
            },
          ],
          recordFilterGroups: [{ id: 'root', logicalOperator: 'OR' }],
        },
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
      }),
    ).toBeNull();
  });

  it('should refuse when a condition on the field sits in a nested AND group', () => {
    expect(
      removeTopLevelChartFilterConditionsOnField({
        filter: {
          recordFilters: [
            { ...closeDateCondition, recordFilterGroupId: 'nested' },
          ],
          recordFilterGroups: [
            { id: 'root', logicalOperator: 'OR' },
            {
              id: 'nested',
              logicalOperator: 'AND',
              parentRecordFilterGroupId: 'root',
            },
          ],
        },
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
      }),
    ).toBeNull();
  });

  it('should return null when no condition uses the field', () => {
    expect(
      removeTopLevelChartFilterConditionsOnField({
        filter: { recordFilters: [stageCondition] },
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
      }),
    ).toBeNull();
    expect(
      removeTopLevelChartFilterConditionsOnField({
        filter: null,
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
      }),
    ).toBeNull();
  });
});
