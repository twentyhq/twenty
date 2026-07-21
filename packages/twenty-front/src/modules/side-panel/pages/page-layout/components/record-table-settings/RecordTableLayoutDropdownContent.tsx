import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import {
  type RecordTableWidgetLayoutViewType,
  useRecordTableWidgetLayoutCallbacks,
} from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar, IconLayoutKanban, IconTable } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { ViewType } from '~/generated-metadata/graphql';

type RecordTableLayoutDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  currentLayoutViewType: RecordTableWidgetLayoutViewType;
};

export const RecordTableLayoutDropdownContent = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  currentLayoutViewType,
}: RecordTableLayoutDropdownContentProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const { handleLayoutChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const defaultGroupByFieldMetadataItem =
    (objectMetadataItem?.readableFields ?? []).find(
      isFieldMetadataItemAvailableAsWidgetGroupByField,
    ) ?? null;

  const defaultCalendarFieldMetadataItem =
    (objectMetadataItem?.readableFields ?? []).find(
      isFieldMetadataItemAvailableAsCalendarField,
    ) ?? null;

  const isKanbanAvailable = isDefined(defaultGroupByFieldMetadataItem);
  const isCalendarAvailable = isDefined(defaultCalendarFieldMetadataItem);

  const handleSelectLayout = (
    targetViewType: RecordTableWidgetLayoutViewType,
  ) => {
    if (targetViewType === ViewType.KANBAN_WIDGET && !isKanbanAvailable) {
      return;
    }
    if (targetViewType === ViewType.CALENDAR_WIDGET && !isCalendarAvailable) {
      return;
    }
    handleLayoutChange({
      targetViewType,
      defaultGroupByFieldMetadataItem,
      defaultCalendarFieldMetadataItem,
    });
    closeDropdown();
  };

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        selectableItemIdArray={[
          ViewType.TABLE_WIDGET,
          ...(isKanbanAvailable ? [ViewType.KANBAN_WIDGET] : []),
          ...(isCalendarAvailable ? [ViewType.CALENDAR_WIDGET] : []),
        ]}
        focusId={dropdownId}
      >
        <SelectableListItem
          itemId={ViewType.TABLE_WIDGET}
          onEnter={() => handleSelectLayout(ViewType.TABLE_WIDGET)}
        >
          <MenuItemSelect
            text={t`Table`}
            LeftIcon={IconTable}
            selected={currentLayoutViewType === ViewType.TABLE_WIDGET}
            focused={selectedItemId === ViewType.TABLE_WIDGET}
            onClick={() => handleSelectLayout(ViewType.TABLE_WIDGET)}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId={ViewType.KANBAN_WIDGET}
          onEnter={() => handleSelectLayout(ViewType.KANBAN_WIDGET)}
        >
          <MenuItemSelect
            text={t`Kanban`}
            LeftIcon={IconLayoutKanban}
            disabled={!isKanbanAvailable}
            contextualText={
              !isKanbanAvailable ? t`Needs a Select field` : undefined
            }
            contextualTextPosition="right"
            selected={currentLayoutViewType === ViewType.KANBAN_WIDGET}
            focused={selectedItemId === ViewType.KANBAN_WIDGET}
            onClick={() => handleSelectLayout(ViewType.KANBAN_WIDGET)}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId={ViewType.CALENDAR_WIDGET}
          onEnter={() => handleSelectLayout(ViewType.CALENDAR_WIDGET)}
        >
          <MenuItemSelect
            text={t`Calendar`}
            LeftIcon={IconCalendar}
            disabled={!isCalendarAvailable}
            contextualText={
              !isCalendarAvailable ? t`Needs a Date field` : undefined
            }
            contextualTextPosition="right"
            selected={currentLayoutViewType === ViewType.CALENDAR_WIDGET}
            focused={selectedItemId === ViewType.CALENDAR_WIDGET}
            onClick={() => handleSelectLayout(ViewType.CALENDAR_WIDGET)}
          />
        </SelectableListItem>
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
