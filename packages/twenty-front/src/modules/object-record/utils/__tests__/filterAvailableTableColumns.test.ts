import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';

describe('filterAvailableTableColumns', () => {
  const createColumnDefinition = (fieldName: string) =>
    ({
      metadata: { fieldName },
    }) as any;

  it('should return false for denied column names', () => {
    expect(
      filterAvailableTableColumns(createColumnDefinition('attachments')),
    ).toBe(false);
    expect(
      filterAvailableTableColumns(createColumnDefinition('activities')),
    ).toBe(false);
    expect(
      filterAvailableTableColumns(createColumnDefinition('timelineActivities')),
    ).toBe(false);
  });

  it('should return true for allowed column names', () => {
    expect(filterAvailableTableColumns(createColumnDefinition('name'))).toBe(
      true,
    );
    expect(filterAvailableTableColumns(createColumnDefinition('email'))).toBe(
      true,
    );
    expect(filterAvailableTableColumns(createColumnDefinition('phone'))).toBe(
      true,
    );
  });
});
