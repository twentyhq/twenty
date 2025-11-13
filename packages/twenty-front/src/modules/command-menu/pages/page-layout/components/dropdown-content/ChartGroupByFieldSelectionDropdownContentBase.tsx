import { ChartGroupByFieldSelectionCompositeFieldView } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
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
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { BarChartGroupMode } from '~/generated/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ChartGroupByFieldSelectionDropdownContentBaseProps<
  T extends ChartConfiguration,
> = {
  fieldMetadataIdKey: keyof T;
  subFieldNameKey: keyof T;
};

export const ChartGroupByFieldSelectionDropdownContentBase = <
  T extends ChartConfiguration,
>({
  fieldMetadataIdKey,
  subFieldNameKey,
}: ChartGroupByFieldSelectionDropdownContentBaseProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCompositeField, setSelectedCompositeField] =
    useState<FieldMetadataItem | null>(null);

  const { objectMetadataItems } = useObjectMetadataItems();

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration as T;

  const currentGroupByFieldMetadataId = configuration?.[fieldMetadataIdKey] as
    | string
    | undefined;
  const currentSubFieldName = configuration?.[subFieldNameKey] as
    | string
    | undefined;

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode?.objectMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const availableFieldMetadataItems = useMemo(
    () =>
      filterBySearchQuery({
        items: sourceObjectMetadataItem?.fields || [],
        searchQuery,
        getSearchableValues: (item) => [item.label, item.name],
        // TODO: remove the relation filter once group by is supported for relation fields
      }).filter((field) => !isFieldRelation(field) && !field.isSystem),
    [sourceObjectMetadataItem?.fields, searchQuery],
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  if (!isDefined(sourceObjectMetadataItem)) {
    return null;
  }

  const buildConfigUpdate = (
    fieldId: string | null,
    subFieldName: string | null,
  ) => {
    const isSecondaryAxis =
      fieldMetadataIdKey === 'secondaryAxisGroupByFieldMetadataId';
    const baseConfig = {
      [fieldMetadataIdKey]: fieldId,
      [subFieldNameKey]: subFieldName,
    };

    if (
      !isSecondaryAxis ||
      configuration.__typename !== 'BarChartConfiguration'
    ) {
      return baseConfig;
    }

    return {
      ...baseConfig,
      groupMode: isDefined(fieldId)
        ? (configuration.groupMode ?? BarChartGroupMode.STACKED)
        : null,
    };
  };

  const handleSelectField = (fieldMetadataItem: FieldMetadataItem) => {
    if (isCompositeFieldType(fieldMetadataItem.type)) {
      setSelectedCompositeField(fieldMetadataItem);
    } else {
      updateCurrentWidgetConfig({
        configToUpdate: buildConfigUpdate(fieldMetadataItem.id, null),
      });
      closeDropdown();
    }
  };

  const handleSelectNone = () => {
    updateCurrentWidgetConfig({
      configToUpdate: buildConfigUpdate(null, null),
    });
    closeDropdown();
  };

  const handleBack = () => {
    setSelectedCompositeField(null);
  };

  const handleSelectSubField = (subFieldName: string) => {
    if (!isDefined(selectedCompositeField)) {
      return;
    }

    updateCurrentWidgetConfig({
      configToUpdate: buildConfigUpdate(
        selectedCompositeField.id,
        subFieldName,
      ),
    });
    closeDropdown();
  };

  if (isDefined(selectedCompositeField)) {
    return (
      <ChartGroupByFieldSelectionCompositeFieldView
        compositeField={selectedCompositeField}
        currentSubFieldName={currentSubFieldName}
        onBack={handleBack}
        onSelectSubField={handleSelectSubField}
      />
    );
  }

  return (
    <>
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
          selectableItemIdArray={[
            'none',
            ...availableFieldMetadataItems.map((item) => item.id),
          ]}
        >
          <SelectableListItem itemId="none" onEnter={handleSelectNone}>
            <MenuItemSelect
              text={t`None`}
              selected={!isDefined(currentGroupByFieldMetadataId)}
              focused={selectedItemId === 'none'}
              onClick={handleSelectNone}
            />
          </SelectableListItem>

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
                  !isCompositeFieldType(fieldMetadataItem.type) &&
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
