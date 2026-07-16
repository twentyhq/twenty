import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { canGroupRecordsByFieldMetadataItem } from '@/object-record/record-group/utils/canGroupRecordsByFieldMetadataItem';
import {
  type RecordTableWidgetLayoutViewType,
  useRecordTableWidgetLayoutCallbacks,
} from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { isFieldMetadataItemAvailableAsWidgetCalendarField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetCalendarField';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
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
      (fieldMetadataItem) =>
        fieldMetadataItem.isActive === true &&
        fieldMetadataItem.type === FieldMetadataType.SELECT &&
        canGroupRecordsByFieldMetadataItem(fieldMetadataItem),
    ) ?? null;

  const defaultCalendarFieldMetadataItem =
    (objectMetadataItem?.readableFields ?? []).find(
      isFieldMetadataItemAvailableAsWidgetCalendarField,
    ) ?? null;

  const isKanbanAvailable = isDefined(defaultGroupByFieldMetadataItem);
  const isCalendarAvailable = isDefined(defaultCalendarFieldMetadataItem);

  const handleSelectLayout = (
    targetViewType: RecordTableWidgetLayoutViewType,
  ) => {
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
        {isKanbanAvailable && (
          <SelectableListItem
            itemId={ViewType.KANBAN_WIDGET}
            onEnter={() => handleSelectLayout(ViewType.KANBAN_WIDGET)}
          >
            <MenuItemSelect
              text={t`Kanban`}
              LeftIcon={IconLayoutKanban}
              selected={currentLayoutViewType === ViewType.KANBAN_WIDGET}
              focused={selectedItemId === ViewType.KANBAN_WIDGET}
              onClick={() => handleSelectLayout(ViewType.KANBAN_WIDGET)}
            />
          </SelectableListItem>
        )}
        {isCalendarAvailable && (
          <SelectableListItem
            itemId={ViewType.CALENDAR_WIDGET}
            onEnter={() => handleSelectLayout(ViewType.CALENDAR_WIDGET)}
          >
            <MenuItemSelect
              text={t`Calendar`}
              LeftIcon={IconCalendar}
              selected={currentLayoutViewType === ViewType.CALENDAR_WIDGET}
              focused={selectedItemId === ViewType.CALENDAR_WIDGET}
              onClick={() => handleSelectLayout(ViewType.CALENDAR_WIDGET)}
            />
          </SelectableListItem>
        )}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
