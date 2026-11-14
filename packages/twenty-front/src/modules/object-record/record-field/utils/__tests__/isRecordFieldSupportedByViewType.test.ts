import { isRecordFieldSupportedByViewType } from '@/object-record/record-field/utils/isRecordFieldSupportedByViewType';
import { ViewType } from '@/views/types/ViewType';

describe('isRecordFieldSupportedByViewType', () => {
  it('should keep extra columns in tables only', () => {
    expect(
      isRecordFieldSupportedByViewType({ isCanonical: false }, ViewType.TABLE),
    ).toBe(true);
    expect(
      isRecordFieldSupportedByViewType({ isCanonical: false }, ViewType.KANBAN),
    ).toBe(false);
  });

  it('should keep canonical fields in every layout', () => {
    expect(isRecordFieldSupportedByViewType({}, ViewType.CALENDAR)).toBe(true);
    expect(
      isRecordFieldSupportedByViewType({ isCanonical: true }, ViewType.LIST),
    ).toBe(true);
  });
});
