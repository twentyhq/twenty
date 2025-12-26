import { ChartGroupByFieldSelectionCompositeFieldView } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { ChartGroupByFieldSelectionRelationFieldView } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionRelationFieldView';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { buildChartGroupByFieldConfigUpdate } from '@/command-menu/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';
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
import { RelationType } from '~/generated/graphql';
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

  const [selectedRelationField, setSelectedRelationField] =
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
      }).filter((field) => {
        if (field.isSystem === true) {
          return false;
        }
        if (isFieldRelation(field)) {
          return field.relation?.type === RelationType.MANY_TO_ONE;
        }
        return true;
      }),
    [sourceObjectMetadataItem?.fields, searchQuery],
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  if (!isDefined(sourceObjectMetadataItem)) {
    return null;
  }

  const handleSelectField = (fieldMetadataItem: FieldMetadataItem) => {
    if (isFieldRelation(fieldMetadataItem)) {
      setSelectedRelationField(fieldMetadataItem);
      return;
    }

    if (isCompositeFieldType(fieldMetadataItem.type)) {
      setSelectedCompositeField(fieldMetadataItem);
      return;
    }

    updateCurrentWidgetConfig({
      configToUpdate: buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey,
        subFieldNameKey,
        fieldId: fieldMetadataItem.id,
        subFieldName: null,
        objectMetadataItem: sourceObjectMetadataItem,
        objectMetadataItems,
      }),
    });
    closeDropdown();
  };

  const handleSelectNone = () => {
    updateCurrentWidgetConfig({
      configToUpdate: buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey,
        subFieldNameKey,
        fieldId: null,
        subFieldName: null,
        objectMetadataItem: sourceObjectMetadataItem,
        objectMetadataItems,
      }),
    });
    closeDropdown();
  };

  const handleBackFromComposite = () => {
    setSelectedCompositeField(null);
  };

  const handleBackFromRelation = () => {
    setSelectedRelationField(null);
  };

  const handleSelectCompositeSubField = (subFieldName: string) => {
    if (!isDefined(selectedCompositeField)) {
      return;
    }

    updateCurrentWidgetConfig({
      configToUpdate: buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey,
        subFieldNameKey,
        fieldId: selectedCompositeField.id,
        subFieldName,
        objectMetadataItem: sourceObjectMetadataItem,
        objectMetadataItems,
      }),
    });
    closeDropdown();
  };

  const handleSelectRelationSubField = (subFieldName: string) => {
    if (!isDefined(selectedRelationField)) {
      return;
    }

    updateCurrentWidgetConfig({
      configToUpdate: buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey,
        subFieldNameKey,
        fieldId: selectedRelationField.id,
        subFieldName,
        objectMetadataItem: sourceObjectMetadataItem,
        objectMetadataItems,
      }),
    });
    closeDropdown();
  };

  if (isDefined(selectedRelationField)) {
    return (
      <ChartGroupByFieldSelectionRelationFieldView
        relationField={selectedRelationField}
        currentSubFieldName={currentSubFieldName}
        onBack={handleBackFromRelation}
        onSelectSubField={handleSelectRelationSubField}
      />
    );
  }

  if (isDefined(selectedCompositeField)) {
    return (
      <ChartGroupByFieldSelectionCompositeFieldView
        compositeField={selectedCompositeField}
        currentSubFieldName={currentSubFieldName}
        onBack={handleBackFromComposite}
        onSelectSubField={handleSelectCompositeSubField}
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
                  !isFieldRelation(fieldMetadataItem) &&
                  currentGroupByFieldMetadataId === fieldMetadataItem.id
                }
                focused={selectedItemId === fieldMetadataItem.id}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                hasSubMenu={
                  isCompositeFieldType(fieldMetadataItem.type) ||
                  isFieldRelation(fieldMetadataItem)
                }
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
