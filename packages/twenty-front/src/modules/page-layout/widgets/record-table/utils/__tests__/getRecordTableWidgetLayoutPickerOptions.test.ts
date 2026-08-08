import { getRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
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

  it('should never disable the table or list layouts', () => {
    const options = getRecordTableWidgetLayoutPickerOptions({
      isKanbanAvailable: false,
      isCalendarAvailable: false,
      isListViewEnabled: true,
    });

    expect(
      options
        .filter((option) =>
          [ViewType.TABLE_WIDGET, ViewType.LIST_WIDGET].includes(
            option.viewType,
          ),
        )
        .map((option) => option.isDisabled),
    ).toEqual([false, false]);
  });
});
