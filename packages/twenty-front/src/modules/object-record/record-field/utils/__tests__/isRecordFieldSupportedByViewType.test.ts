import { isRecordFieldSupportedByViewType } from '@/object-record/record-field/utils/isRecordFieldSupportedByViewType';
import { ViewType } from '@/views/types/ViewType';

describe('isRecordFieldSupportedByViewType', () => {
  it('should keep extra columns in tables only', () => {
    expect(
      isRecordFieldSupportedByViewType({
        recordField: { isCanonical: false },
        viewType: ViewType.TABLE,
      }),
    ).toBe(true);
    expect(
      isRecordFieldSupportedByViewType({
        recordField: { isCanonical: false },
        viewType: ViewType.KANBAN,
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
