import { isGroupLoadLimitSupportedForViewType } from '@/object-record/record-group/utils/isGroupLoadLimitSupportedForViewType';
import { ViewType } from '@/views/types/ViewType';

describe('isGroupLoadLimitSupportedForViewType', () => {
  it.each([ViewType.TABLE, ViewType.LIST])(
    'pages a %s view group with the view load limit',
    (viewType) => {
      expect(isGroupLoadLimitSupportedForViewType(viewType)).toBe(true);
    },
  );

  it.each([ViewType.KANBAN, ViewType.CALENDAR])(
    'leaves a %s view on its own paging',
    (viewType) => {
      expect(isGroupLoadLimitSupportedForViewType(viewType)).toBe(false);
    },
  );
});
