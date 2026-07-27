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

  const calendarLayoutOptions = [
    { value: ViewCalendarLayout.DAY, label: t`Day`, Icon: IconCalendarEvent },
    { value: ViewCalendarLayout.WEEK, label: t`Week`, Icon: IconCalendarWeek },
    {
      value: ViewCalendarLayout.MONTH,
      label: t`Month`,
      Icon: IconCalendarMonth,
    },
  ];

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        selectableItemIdArray={calendarLayoutOptions.map(({ value }) => value)}
        focusId={dropdownId}
      >
        {calendarLayoutOptions.map(({ value, label, Icon }) => (
          <SelectableListItem
            key={value}
            itemId={value}
            onEnter={() => handleSelect(value)}
          >
            <MenuItemSelect
              text={label}
              LeftIcon={Icon}
              selected={currentCalendarLayout === value}
              focused={selectedItemId === value}
              onClick={() => handleSelect(value)}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
