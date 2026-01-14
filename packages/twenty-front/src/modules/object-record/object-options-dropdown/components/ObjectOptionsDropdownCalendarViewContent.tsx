import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { recordIndexCalendarLayoutState } from '@/object-record/record-index/states/recordIndexCalendarLayoutState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { t } from '@lingui/core/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Pill } from 'twenty-ui/components';
import {
  IconCalendarMonth,
  IconCalendarWeek,
  IconChevronLeft,
  IconTimelineEvent,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const ObjectOptionsDropdownCalendarViewContent = () => {
  const { resetContent } = useObjectOptionsDropdown();
  const recordIndexCalendarLayout = useRecoilValue(
    recordIndexCalendarLayoutState,
  );
  const setRecordIndexCalendarLayout = useSetRecoilState(
    recordIndexCalendarLayoutState,
  );
  const { updateCurrentView } = useUpdateCurrentView();

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const { closeDropdown } = useObjectOptionsDropdown();

  const selectableItemIdArray = [
    ViewCalendarLayout.WEEK,
    ViewCalendarLayout.MONTH,
    ViewCalendarLayout.DAY,
  ];

  const handleCalendarViewChange = async (calendarView: ViewCalendarLayout) => {
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
            itemId={ViewCalendarLayout.WEEK}
            onEnter={() => {
              handleCalendarViewChange(ViewCalendarLayout.WEEK);
            }}
          >
            <MenuItemSelect
              LeftIcon={IconCalendarWeek}
              text={t`Week`}
              selected={recordIndexCalendarLayout === ViewCalendarLayout.WEEK}
              focused={selectedItemId === ViewCalendarLayout.WEEK}
              contextualText={<Pill label={t`Soon`} />}
              contextualTextPosition="right"
              disabled
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
          <SelectableListItem
            itemId={ViewCalendarLayout.DAY}
            onEnter={() => handleCalendarViewChange(ViewCalendarLayout.DAY)}
          >
            <MenuItemSelect
              LeftIcon={IconTimelineEvent}
              text={t`Timeline`}
              selected={recordIndexCalendarLayout === ViewCalendarLayout.DAY}
              focused={selectedItemId === ViewCalendarLayout.DAY}
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
