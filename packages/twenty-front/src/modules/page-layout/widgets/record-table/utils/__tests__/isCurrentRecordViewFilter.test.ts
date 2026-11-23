import { isCurrentRecordViewFilter } from '@/page-layout/widgets/record-table/utils/isCurrentRecordViewFilter';

describe('isCurrentRecordViewFilter', () => {
  it('matches a filter on the current record', () => {
    expect(
      isCurrentRecordViewFilter({
        value: JSON.stringify({
          selectedRecordIds: [],
          isCurrentRecordSelected: true,
        }),
      }),
    ).toBe(true);
  });

  it.each([
    JSON.stringify({ selectedRecordIds: ['record-id'] }),
    JSON.stringify({
      selectedRecordIds: [],
      isCurrentWorkspaceMemberSelected: true,
    }),
    'Acme',
    '',
  ])('does not match %j', (value) => {
    expect(isCurrentRecordViewFilter({ value })).toBe(false);
  });
});
