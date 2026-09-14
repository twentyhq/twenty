import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { useRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutPickerOptions';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import {
  getSelectableLayoutViewTypes,
  isSelectableLayout,
} from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { RecordTableWidgetLayoutMenuItems } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableWidgetLayoutMenuItems';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

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

  const {
    layoutOptions,
    defaultGroupByFieldMetadataItem,
    defaultCalendarFieldMetadataItem,
  } = useRecordTableWidgetLayoutPickerOptions(objectMetadataItem);

  const handleSelectLayout = (
    targetViewType: RecordTableWidgetLayoutViewType,
  ) => {
    if (!isSelectableLayout(layoutOptions, targetViewType)) {
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
        selectableItemIdArray={getSelectableLayoutViewTypes(layoutOptions)}
        focusId={dropdownId}
      >
        <RecordTableWidgetLayoutMenuItems
          layoutOptions={layoutOptions}
          selectedViewType={currentLayoutViewType}
          focusedItemId={selectedItemId}
          onSelect={handleSelectLayout}
        />
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
