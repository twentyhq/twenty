import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import {
  getRecordTableWidgetLayoutPickerOptions,
  isSelectableLayout,
} from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  const { t } = useLingui();

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

  const isListViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LIST_VIEW_ENABLED,
  );

  const isKanbanAvailable = isDefined(defaultGroupByFieldMetadataItem);
  const isCalendarAvailable = isDefined(defaultCalendarFieldMetadataItem);

  const layoutOptions = getRecordTableWidgetLayoutPickerOptions({
    isKanbanAvailable,
    isCalendarAvailable,
    isListViewEnabled,
  });

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
        selectableItemIdArray={layoutOptions
          .filter((layoutOption) => !layoutOption.isDisabled)
          .map((layoutOption) => layoutOption.viewType)}
        focusId={dropdownId}
      >
        {layoutOptions.map(
          ({ viewType, Icon, label, isDisabled, unavailableReason }) => (
            <SelectableListItem
              key={viewType}
              itemId={viewType}
              onEnter={() => handleSelectLayout(viewType)}
            >
              <MenuItemSelect
                text={t(label)}
                LeftIcon={Icon}
                disabled={isDisabled}
                contextualText={
                  isDefined(unavailableReason)
                    ? t(unavailableReason)
                    : undefined
                }
                contextualTextPosition="right"
                selected={currentLayoutViewType === viewType}
                focused={selectedItemId === viewType}
                onClick={() => handleSelectLayout(viewType)}
              />
            </SelectableListItem>
          ),
        )}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
