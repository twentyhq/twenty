import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
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
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
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
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

const RECORD_CALENDAR_TIMELINE_VIEW_ID = 'record-calendar-timeline-view';

export const ObjectOptionsDropdownCalendarViewContent = () => {
  const { resetContent } = useObjectOptionsDropdown();
  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );
  const setRecordIndexCalendarLayout = useSetAtomComponentState(
    recordIndexCalendarLayoutComponentState,
  );
  const { updateCurrentView } = useUpdateCurrentView();

  const scopedObjectOptionsDropdownId =
    useWorkspaceSurfaceScopedComponentInstanceId(OBJECT_OPTIONS_DROPDOWN_ID);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    scopedObjectOptionsDropdownId,
  );

  const { closeDropdown } = useObjectOptionsDropdown();

  const selectableItemIdArray = [
    ViewCalendarLayout.DAY,
    ViewCalendarLayout.WEEK,
    ViewCalendarLayout.MONTH,
    RECORD_CALENDAR_TIMELINE_VIEW_ID,
  ];

  const handleCalendarViewChange = async (calendarView: ViewCalendarLayout) => {
    if (calendarView === recordIndexCalendarLayout) {
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
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.DAY)}
          >
            <MenuItemSelect
              LeftIcon={IconCalendarEvent}
              text={t`Day`}
              selected={recordIndexCalendarLayout === ViewCalendarLayout.DAY}
              onClick={() => handleCalendarViewChange(ViewCalendarLayout.DAY)}
              focused={selectedItemId === ViewCalendarLayout.DAY}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewCalendarLayout.WEEK}
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.WEEK)}
          >
            <MenuItemSelect
              LeftIcon={IconCalendarWeek}
              text={t`Week`}
              selected={recordIndexCalendarLayout === ViewCalendarLayout.WEEK}
              onClick={() => handleCalendarViewChange(ViewCalendarLayout.WEEK)}
              focused={selectedItemId === ViewCalendarLayout.WEEK}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewCalendarLayout.MONTH}
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.MONTH)}
          >
            <MenuItemSelect
              LeftIcon={IconCalendarMonth}
              text={t`Month`}
              selected={recordIndexCalendarLayout === ViewCalendarLayout.MONTH}
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
