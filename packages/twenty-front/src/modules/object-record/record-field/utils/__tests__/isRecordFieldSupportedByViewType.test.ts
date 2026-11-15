import { isRecordFieldSupportedByViewType } from '@/object-record/record-field/utils/isRecordFieldSupportedByViewType';
import { ViewType } from '@/views/types/ViewType';

describe('isRecordFieldSupportedByViewType', () => {
  it('should keep extra columns in tables, boards and calendars', () => {
    expect(
      [ViewType.TABLE, ViewType.KANBAN, ViewType.CALENDAR].map((viewType) =>
        isRecordFieldSupportedByViewType({
          recordField: { isCanonical: false },
          viewType,
        }),
      ),
    ).toEqual([true, true, true]);
  });

  it('should keep extra columns out of the list layout', () => {
    expect(
      isRecordFieldSupportedByViewType({
        recordField: { isCanonical: false },
        viewType: ViewType.LIST,
      }),
    ).toBe(false);
  });

  it('should keep canonical fields in every layout', () => {
    expect(
      isRecordFieldSupportedByViewType({
        recordField: {},
        viewType: ViewType.CALENDAR,
      }),
    ).toBe(true);
    expect(
      isRecordFieldSupportedByViewType({
        recordField: { isCanonical: true },
        viewType: ViewType.LIST,
      }),
    ).toBe(true);
  });
});
