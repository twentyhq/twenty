import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import {
  IconCalendarEvent,
  IconCalendarMonth,
  IconCalendarWeek,
} from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

type RecordTableCalendarLayoutDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  currentCalendarLayout: ViewCalendarLayout;
};

export const RecordTableCalendarLayoutDropdownContent = ({
  pageLayoutId,
  widgetId,
  currentCalendarLayout,
}: RecordTableCalendarLayoutDropdownContentProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const { handleCalendarLayoutChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const handleSelect = (calendarLayout: ViewCalendarLayout) => {
    handleCalendarLayoutChange(calendarLayout);
    closeDropdown();
  };

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        selectableItemIdArray={[
          ViewCalendarLayout.DAY,
          ViewCalendarLayout.WEEK,
          ViewCalendarLayout.MONTH,
        ]}
        focusId={dropdownId}
      >
        <SelectableListItem
          itemId={ViewCalendarLayout.DAY}
          onEnter={() => handleSelect(ViewCalendarLayout.DAY)}
        >
          <MenuItemSelect
            text={t`Day`}
            LeftIcon={IconCalendarEvent}
            selected={currentCalendarLayout === ViewCalendarLayout.DAY}
            focused={selectedItemId === ViewCalendarLayout.DAY}
            onClick={() => handleSelect(ViewCalendarLayout.DAY)}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId={ViewCalendarLayout.WEEK}
          onEnter={() => handleSelect(ViewCalendarLayout.WEEK)}
        >
          <MenuItemSelect
            text={t`Week`}
            LeftIcon={IconCalendarWeek}
            selected={currentCalendarLayout === ViewCalendarLayout.WEEK}
            focused={selectedItemId === ViewCalendarLayout.WEEK}
            onClick={() => handleSelect(ViewCalendarLayout.WEEK)}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId={ViewCalendarLayout.MONTH}
          onEnter={() => handleSelect(ViewCalendarLayout.MONTH)}
        >
          <MenuItemSelect
            text={t`Month`}
            LeftIcon={IconCalendarMonth}
            selected={currentCalendarLayout === ViewCalendarLayout.MONTH}
            focused={selectedItemId === ViewCalendarLayout.MONTH}
            onClick={() => handleSelect(ViewCalendarLayout.MONTH)}
          />
        </SelectableListItem>
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
