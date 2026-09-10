import { isRecordGroupingOptionalForViewType } from '@/object-record/record-group/utils/isRecordGroupingOptionalForViewType';
import { ViewType } from '@/views/types/ViewType';

describe('isRecordGroupingOptionalForViewType', () => {
  it.each([ViewType.TABLE, ViewType.LIST])(
    'lets a %s view drop its grouping',
    (viewType) => {
      expect(isRecordGroupingOptionalForViewType(viewType)).toBe(true);
    },
  );

  it.each([ViewType.KANBAN, ViewType.CALENDAR])(
    'keeps grouping mandatory for a %s view',
    (viewType) => {
      expect(isRecordGroupingOptionalForViewType(viewType)).toBe(false);
    },
  );
});
