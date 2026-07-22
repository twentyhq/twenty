import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { Pill } from 'twenty-ui/data-display';
import {
  IconCalendarEvent,
  IconCalendarMonth,
  IconCalendarWeek,
  IconChevronLeft,
  IconTimelineEvent,
} from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  FeatureFlagKey,
  ViewCalendarLayout,
} from '~/generated-metadata/graphql';

const RECORD_CALENDAR_TIMELINE_VIEW_ID = 'record-calendar-timeline-view';

export const ObjectOptionsDropdownCalendarViewContent = () => {
  const { resetContent } = useObjectOptionsDropdown();
  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );
  const supportedCalendarLayout = getSupportedRecordCalendarLayout({
    calendarLayout: recordIndexCalendarLayout,
    isCalendarWeekViewEnabled,
  });
  const setRecordIndexCalendarLayout = useSetAtomComponentState(
    recordIndexCalendarLayoutComponentState,
  );
  const { updateCurrentView } = useUpdateCurrentView();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const { closeDropdown } = useObjectOptionsDropdown();

  const selectableItemIdArray = [
    ViewCalendarLayout.DAY,
    ViewCalendarLayout.WEEK,
    ViewCalendarLayout.MONTH,
    RECORD_CALENDAR_TIMELINE_VIEW_ID,
  ];

  const handleCalendarViewChange = async (calendarView: ViewCalendarLayout) => {
    const isTimeGridLayout =
      calendarView === ViewCalendarLayout.DAY ||
      calendarView === ViewCalendarLayout.WEEK;

    if (isTimeGridLayout && !isCalendarWeekViewEnabled) {
      return;
    }

    if (calendarView === supportedCalendarLayout) {
      closeDropdown();
      return;
    }

    setRecordIndexCalendarLayout(calendarView);
    await updateCurrentView({
      calendarLayout: calendarView,
    });
    closeDropdown();
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Calendar View`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={ViewCalendarLayout.DAY}
            onEnter={() => {
              if (isCalendarWeekViewEnabled) {
                handleCalendarViewChange(ViewCalendarLayout.DAY);
              }
            }}
          >
            <MenuItemSelect
              LeftIcon={IconCalendarEvent}
              text={t`Day`}
              selected={supportedCalendarLayout === ViewCalendarLayout.DAY}
              onClick={
                isCalendarWeekViewEnabled
                  ? () => handleCalendarViewChange(ViewCalendarLayout.DAY)
                  : undefined
              }
              focused={selectedItemId === ViewCalendarLayout.DAY}
              contextualText={
                isCalendarWeekViewEnabled ? undefined : <Pill label={t`Soon`} />
              }
              contextualTextPosition="right"
              disabled={!isCalendarWeekViewEnabled}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewCalendarLayout.WEEK}
            onEnter={() => {
              if (isCalendarWeekViewEnabled) {
                handleCalendarViewChange(ViewCalendarLayout.WEEK);
              }
            }}
          >
            <MenuItemSelect
              LeftIcon={IconCalendarWeek}
              text={t`Week`}
              selected={supportedCalendarLayout === ViewCalendarLayout.WEEK}
              onClick={
                isCalendarWeekViewEnabled
                  ? () => handleCalendarViewChange(ViewCalendarLayout.WEEK)
                  : undefined
              }
              focused={selectedItemId === ViewCalendarLayout.WEEK}
              contextualText={
                isCalendarWeekViewEnabled ? undefined : <Pill label={t`Soon`} />
              }
              contextualTextPosition="right"
              disabled={!isCalendarWeekViewEnabled}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewCalendarLayout.MONTH}
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.MONTH)}
          >
            <MenuItemSelect
              LeftIcon={IconCalendarMonth}
              text={t`Month`}
              selected={supportedCalendarLayout === ViewCalendarLayout.MONTH}
              onClick={() => handleCalendarViewChange(ViewCalendarLayout.MONTH)}
              focused={selectedItemId === ViewCalendarLayout.MONTH}
            />
          </SelectableListItem>
          <SelectableListItem itemId={RECORD_CALENDAR_TIMELINE_VIEW_ID}>
            <MenuItemSelect
              LeftIcon={IconTimelineEvent}
              text={t`Timeline`}
              selected={false}
              focused={selectedItemId === RECORD_CALENDAR_TIMELINE_VIEW_ID}
              contextualText={<Pill label={t`Soon`} />}
              contextualTextPosition="right"
              disabled
            />
          </SelectableListItem>
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
