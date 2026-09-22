import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { t } from '@lingui/core/macro';
import { Pill } from 'twenty-ui/components';
import {
  IconCalendarEvent,
  IconCalendarMonth,
  IconCalendarWeek,
  IconChevronLeft,
  IconTimelineEvent,
} from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

const RECORD_CALENDAR_TIMELINE_VIEW_ID = 'record-calendar-timeline-view';

export const ObjectOptionsDropdownCalendarViewContent = () => {
  const { resetContent, dropdownId } = useObjectOptionsDropdown();
  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );
  const setRecordIndexCalendarLayout = useSetAtomComponentState(
    recordIndexCalendarLayoutComponentState,
  );
  const { updateCurrentView } = useUpdateCurrentView();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
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
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={ViewCalendarLayout.DAY}
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.DAY)}
          >
            <ListItem
              onClick={() => handleCalendarViewChange(ViewCalendarLayout.DAY)}
              focused={selectedItemId === ViewCalendarLayout.DAY}
              role="option"
              aria-selected={
                recordIndexCalendarLayout === ViewCalendarLayout.DAY
              }
              selected={recordIndexCalendarLayout === ViewCalendarLayout.DAY}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconCalendarEvent} />}
            >{t`Day`}</ListItem>
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewCalendarLayout.WEEK}
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.WEEK)}
          >
            <ListItem
              onClick={() => handleCalendarViewChange(ViewCalendarLayout.WEEK)}
              focused={selectedItemId === ViewCalendarLayout.WEEK}
              role="option"
              aria-selected={
                recordIndexCalendarLayout === ViewCalendarLayout.WEEK
              }
              selected={recordIndexCalendarLayout === ViewCalendarLayout.WEEK}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconCalendarWeek} />}
            >{t`Week`}</ListItem>
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewCalendarLayout.MONTH}
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.MONTH)}
          >
            <ListItem
              onClick={() => handleCalendarViewChange(ViewCalendarLayout.MONTH)}
              focused={selectedItemId === ViewCalendarLayout.MONTH}
              role="option"
              aria-selected={
                recordIndexCalendarLayout === ViewCalendarLayout.MONTH
              }
              selected={recordIndexCalendarLayout === ViewCalendarLayout.MONTH}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconCalendarMonth} />}
            >{t`Month`}</ListItem>
          </SelectableListItem>
          <SelectableListItem itemId={RECORD_CALENDAR_TIMELINE_VIEW_ID}>
            <ListItem
              focused={selectedItemId === RECORD_CALENDAR_TIMELINE_VIEW_ID}
              disabled
              role="option"
              aria-selected={false}
              selected={false}
              indicator="check"
              description={<Pill label={t`Soon`} />}
              descriptionPlacement={'end'}
              startIcon={<SelectOptionIcon Icon={IconTimelineEvent} />}
            >{t`Timeline`}</ListItem>
          </SelectableListItem>
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
