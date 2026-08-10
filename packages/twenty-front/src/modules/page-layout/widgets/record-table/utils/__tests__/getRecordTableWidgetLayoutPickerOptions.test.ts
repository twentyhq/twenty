import {
  getRecordTableWidgetLayoutPickerOptions,
  isSelectableLayout,
} from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { isDefined } from 'twenty-shared/utils';
import { ViewType } from '~/generated-metadata/graphql';

const ALL_AVAILABLE = {
  isKanbanAvailable: true,
  isCalendarAvailable: true,
  isListViewEnabled: true,
};

describe('getRecordTableWidgetLayoutPickerOptions', () => {
  it('should offer every layout in picker order', () => {
    expect(
      getRecordTableWidgetLayoutPickerOptions(ALL_AVAILABLE).map(
        (option) => option.viewType,
      ),
    ).toEqual([
      ViewType.TABLE_WIDGET,
      ViewType.KANBAN_WIDGET,
      ViewType.LIST_WIDGET,
      ViewType.CALENDAR_WIDGET,
    ]);
  });

  it('should hide the list layout while the feature flag is off', () => {
    expect(
      getRecordTableWidgetLayoutPickerOptions({
        ...ALL_AVAILABLE,
        isListViewEnabled: false,
      }).map((option) => option.viewType),
    ).not.toContain(ViewType.LIST_WIDGET);
  });

  it('should enable every offered layout when the object supports them all', () => {
    expect(
      getRecordTableWidgetLayoutPickerOptions(ALL_AVAILABLE).every(
        (option) => !option.isDisabled && !isDefined(option.unavailableReason),
      ),
    ).toBe(true);
  });

  it.each([
    [ViewType.KANBAN_WIDGET, { isKanbanAvailable: false }],
    [ViewType.CALENDAR_WIDGET, { isCalendarAvailable: false }],
  ])(
    'should keep %s visible but disabled with a reason when the object cannot back it',
    (viewType, unavailable) => {
      const option = getRecordTableWidgetLayoutPickerOptions({
        ...ALL_AVAILABLE,
        ...unavailable,
      }).find((optionToFind) => optionToFind.viewType === viewType);

      expect(option?.isDisabled).toBe(true);
      expect(isDefined(option?.unavailableReason)).toBe(true);
    },
  );

  it('should refuse a layout the picker disabled or never offered', () => {
    const options = getRecordTableWidgetLayoutPickerOptions({
      isKanbanAvailable: false,
      isCalendarAvailable: true,
      isListViewEnabled: false,
    });

    expect(isSelectableLayout(options, ViewType.TABLE_WIDGET)).toBe(true);
    expect(isSelectableLayout(options, ViewType.CALENDAR_WIDGET)).toBe(true);
    expect(isSelectableLayout(options, ViewType.KANBAN_WIDGET)).toBe(false);
    expect(isSelectableLayout(options, ViewType.LIST_WIDGET)).toBe(false);
  });

  it('should never disable the table or list layouts', () => {
    const options = getRecordTableWidgetLayoutPickerOptions({
      isKanbanAvailable: false,
      isCalendarAvailable: false,
      isListViewEnabled: true,
    });
    const isDisabled = (viewType: ViewType) =>
      options.find((option) => option.viewType === viewType)?.isDisabled;

    expect(isDisabled(ViewType.TABLE_WIDGET)).toBe(false);
    expect(isDisabled(ViewType.LIST_WIDGET)).toBe(false);
  });
});
