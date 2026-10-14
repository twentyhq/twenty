import { getRecordTableColumnWidthRules } from '@/object-record/record-table/utils/getRecordTableColumnWidthRules';

describe('getRecordTableColumnWidthRules', () => {
  it('sizes every column of the table from its width variable', () => {
    const rules = getRecordTableColumnWidthRules({
      scopeSelector: '[id="record-table-people"]',
      columnCount: 150,
    }).split('\n');

    expect(rules).toHaveLength(150);
    expect(rules[149]).toBe(
      '[id="record-table-people"] div.record-table-column-field-149 { width: var(--record-table-column-field-149); min-width: var(--record-table-column-field-149); max-width: var(--record-table-column-field-149); }',
    );
  });
});
