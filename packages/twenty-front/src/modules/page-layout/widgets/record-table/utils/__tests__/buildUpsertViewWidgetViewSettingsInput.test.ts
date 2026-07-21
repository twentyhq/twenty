import { type FlatView } from '@/metadata-store/types/FlatView';
import { buildUpsertViewWidgetViewSettingsInput } from '@/page-layout/widgets/record-table/utils/buildUpsertViewWidgetViewSettingsInput';
import {
  ViewCalendarLayout,
  ViewOpenRecordIn,
  ViewType,
} from '~/generated-metadata/graphql';

const buildFlatView = (overrides: Partial<FlatView>): FlatView =>
  ({
    type: ViewType.TABLE_WIDGET,
    shouldHideEmptyGroups: false,
    openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
    ...overrides,
  }) as FlatView;

describe('buildUpsertViewWidgetViewSettingsInput', () => {
  it('normalizes every nullable setting to null when unset', () => {
    const input = buildUpsertViewWidgetViewSettingsInput(buildFlatView({}));

    expect(input).toEqual({
      type: ViewType.TABLE_WIDGET,
      mainGroupByFieldMetadataId: null,
      shouldHideEmptyGroups: false,
      openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
      kanbanAggregateOperation: null,
      kanbanAggregateOperationFieldMetadataId: null,
      kanbanColumnWidth: null,
      calendarLayout: null,
      calendarFieldMetadataId: null,
      calendarEndFieldMetadataId: null,
    });
  });

  it('passes through defined settings', () => {
    const input = buildUpsertViewWidgetViewSettingsInput(
      buildFlatView({
        type: ViewType.CALENDAR_WIDGET,
        shouldHideEmptyGroups: true,
        calendarLayout: ViewCalendarLayout.MONTH,
        calendarFieldMetadataId: 'calendar-field-id',
        mainGroupByFieldMetadataId: 'group-by-id',
      }),
    );

    expect(input.type).toBe(ViewType.CALENDAR_WIDGET);
    expect(input.shouldHideEmptyGroups).toBe(true);
    expect(input.calendarLayout).toBe(ViewCalendarLayout.MONTH);
    expect(input.calendarFieldMetadataId).toBe('calendar-field-id');
    expect(input.mainGroupByFieldMetadataId).toBe('group-by-id');
  });
});
