import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ChartGroupByFieldSelectionDropdownContentBaseProps = {
  headerLabel: ReactNode;
  fieldMetadataIdKey: string;
  subFieldNameKey: string;
  allowedChartTypes: string[];
};

export const ChartGroupByFieldSelectionDropdownContentBase = ({
  headerLabel,
  fieldMetadataIdKey,
  subFieldNameKey,
  allowedChartTypes,
}: ChartGroupByFieldSelectionDropdownContentBaseProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompositeField, setSelectedCompositeField] =
    useState<FieldMetadataItem | null>(null);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (
    !isDefined(widgetInEditMode?.configuration?.__typename) ||
    !allowedChartTypes.includes(widgetInEditMode.configuration.__typename)
  ) {
    throw new Error('Invalid configuration type');
  }

  const currentGroupByFieldMetadataId: string | undefined =
    widgetInEditMode.configuration[
      fieldMetadataIdKey as keyof typeof widgetInEditMode.configuration
    ];

  const currentSubFieldName: string | undefined =
    widgetInEditMode.configuration[
      subFieldNameKey as keyof typeof widgetInEditMode.configuration
    ];

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode.objectMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const availableFieldMetadataItems = filterBySearchQuery({
    items: sourceObjectMetadataItem?.fields || [],
    searchQuery,
    getSearchableValues: (item) => [item.label, item.name],
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  if (!isDefined(sourceObjectMetadataItem)) {
    return null;
  }

  const handleSelectField = (fieldMetadataItem: FieldMetadataItem) => {
    if (isCompositeFieldType(fieldMetadataItem.type)) {
      setSelectedCompositeField(fieldMetadataItem);
    } else {
      updateCurrentWidgetConfig({
        configToUpdate: {
          [fieldMetadataIdKey]: fieldMetadataItem.id,
          [subFieldNameKey]: null,
        },
      });
      closeDropdown();
    }
  };

  const handleBack = () => {
    setSelectedCompositeField(null);
  };

  const handleSelectSubField = (subFieldName: string) => {
    if (!isDefined(selectedCompositeField)) {
      return;
    }

    updateCurrentWidgetConfig({
      configToUpdate: {
        [fieldMetadataIdKey]: selectedCompositeField.id,
        [subFieldNameKey]: subFieldName,
      },
    });
    closeDropdown();
  };

  if (isDefined(selectedCompositeField)) {
    const compositeFieldType =
      selectedCompositeField.type as CompositeFieldType;

    const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
      compositeFieldType
    ].subFields.map((subField) => subField.subFieldName);

    const selectableItemIdArray = subFieldNames.map(
      (subFieldName) => subFieldName,
    );

    return (
      <>
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={handleBack}
              Icon={IconChevronLeft}
            />
          }
        >
          {headerLabel}: {selectedCompositeField.label}
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
                      selectedCompositeField.icon,
                  )}
                />
              </SelectableListItem>
            ))}
          </SelectableList>
        </DropdownMenuItemsContainer>
      </>
    );
  }

  return (
    <>
      <DropdownMenuHeader>{headerLabel}</DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search fields`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={availableFieldMetadataItems.map(
            (item) => item.id,
          )}
        >
          {availableFieldMetadataItems.map((fieldMetadataItem) => (
            <SelectableListItem
              key={fieldMetadataItem.id}
              itemId={fieldMetadataItem.id}
              onEnter={() => {
                handleSelectField(fieldMetadataItem);
              }}
            >
              <MenuItemSelect
                text={fieldMetadataItem.label}
                selected={
                  currentGroupByFieldMetadataId === fieldMetadataItem.id
                }
                focused={selectedItemId === fieldMetadataItem.id}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                hasSubMenu={isCompositeFieldType(fieldMetadataItem.type)}
                onClick={() => {
                  handleSelectField(fieldMetadataItem);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
