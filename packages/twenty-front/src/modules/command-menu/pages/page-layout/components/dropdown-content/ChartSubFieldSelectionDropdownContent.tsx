import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

type ChartSubFieldSelectionDropdownContentProps = {
  fieldMetadataItem: FieldMetadataItem;
  axis: 'X' | 'Y';
  onBack: () => void;
};

export const ChartSubFieldSelectionDropdownContent = ({
  fieldMetadataItem,
  axis,
  onBack,
}: ChartSubFieldSelectionDropdownContentProps) => {
  const { getIcon } = useIcons();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (
    widgetInEditMode?.configuration?.__typename !== 'BarChartConfiguration' &&
    widgetInEditMode?.configuration?.__typename !== 'LineChartConfiguration'
  ) {
    throw new Error('Invalid configuration type');
  }

  const currentSubFieldName =
    axis === 'X'
      ? widgetInEditMode.configuration.groupBySubFieldNameX
      : widgetInEditMode.configuration.groupBySubFieldNameY;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const compositeFieldType = fieldMetadataItem.type as CompositeFieldType;

  const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    compositeFieldType
  ].subFields.map((subField) => subField.subFieldName);

  const handleSelectSubField = (subFieldName: string) => {
    updateCurrentWidgetConfig({
      configToUpdate:
        axis === 'X'
          ? {
              groupByFieldMetadataIdX: fieldMetadataItem.id,
              groupBySubFieldNameX: subFieldName,
            }
          : {
              groupByFieldMetadataIdY: fieldMetadataItem.id,
              groupBySubFieldNameY: subFieldName,
            },
    });
    closeDropdown();
  };

  const selectableItemIdArray = subFieldNames.map(
    (subFieldName) => subFieldName,
  );

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {axis === 'X' ? (
          <Trans>X-Axis Field</Trans>
        ) : (
          <Trans>Y-Axis Group By Field</Trans>
        )}
        : {fieldMetadataItem.label}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          {subFieldNames.map((subFieldName) => (
            <SelectableListItem
              key={subFieldName}
              itemId={subFieldName}
              onEnter={() => {
                handleSelectSubField(subFieldName);
              }}
            >
              <MenuItemSelect
                text={getCompositeSubFieldLabel(
                  compositeFieldType,
                  subFieldName,
                )}
                selected={currentSubFieldName === subFieldName}
                focused={selectedItemId === subFieldName}
                onClick={() => {
                  if (isDefined(subFieldName)) {
                    handleSelectSubField(subFieldName);
                  }
                }}
                LeftIcon={getIcon(
                  ICON_NAME_BY_SUB_FIELD[subFieldName] ??
                    fieldMetadataItem.icon,
                )}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
