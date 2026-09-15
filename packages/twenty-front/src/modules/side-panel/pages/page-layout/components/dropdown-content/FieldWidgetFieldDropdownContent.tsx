import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isAdvancedRelationFieldMetadataItem } from '@/object-record/utils/isAdvancedRelationFieldMetadataItem';
import { isFieldWidgetEligibleNestedParentField } from '@/page-layout/widgets/field/utils/isFieldWidgetEligibleNestedParentField';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { useResolveFieldWidgetRelationTableViewIdChange } from '@/page-layout/widgets/record-table/hooks/useResolveFieldWidgetRelationTableViewIdChange';
import { useFieldWidgetEligibleFields } from '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields';
import { getFieldWidgetEligibleNestedFields } from '@/page-layout/widgets/field/utils/getFieldWidgetEligibleNestedFields';
import {
  getFieldWidgetDefaultDisplayMode,
  isDisplayModeValidForFieldType,
} from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { FieldWidgetNestedFieldDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/FieldWidgetNestedFieldDropdownContent';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { FieldDisplayMode } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const FieldWidgetFieldDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [drillInFieldMetadataItem, setDrillInFieldMetadataItem] =
    useState<FieldMetadataItem | null>(null);

  const { pageLayoutId, objectNameSingular } =
    usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;
  const currentNestedRelationFieldMetadataId =
    fieldConfiguration?.nestedRelationFieldMetadataId;

  const allFieldWidgetFieldMetadataItems =
    useFieldWidgetEligibleFields(objectNameSingular);

  const { objectMetadataItems } = useObjectMetadataItems();

  const { advancedFieldMetadataItems, regularFieldMetadataItems } = useMemo(
    () =>
      allFieldWidgetFieldMetadataItems.reduce<{
        advancedFieldMetadataItems: typeof allFieldWidgetFieldMetadataItems;
        regularFieldMetadataItems: typeof allFieldWidgetFieldMetadataItems;
      }>(
        (accumulator, fieldMetadataItem) => {
          const isAdvancedField = isAdvancedRelationFieldMetadataItem(
            fieldMetadataItem,
            objectMetadataItems,
          );

          if (isAdvancedField) {
            accumulator.advancedFieldMetadataItems.push(fieldMetadataItem);
          } else {
            accumulator.regularFieldMetadataItems.push(fieldMetadataItem);
          }

          return accumulator;
        },
        {
          advancedFieldMetadataItems: [],
          regularFieldMetadataItems: [],
        },
      ),
    [allFieldWidgetFieldMetadataItems, objectMetadataItems],
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const { resolveFieldWidgetRelationTableViewIdChange } =
    useResolveFieldWidgetRelationTableViewIdChange(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { setSelectedItemId, resetSelectedItem } =
    useSelectableList(dropdownId);

  const { getIcon } = useIcons();

  const searchableFieldMetadataItems = [
    ...regularFieldMetadataItems,
    ...advancedFieldMetadataItems,
  ];

  const availableFields = filterBySearchQuery({
    items: searchableFieldMetadataItems,
    searchQuery,
    getSearchableValues: (item) => [item.label],
  });

  const { fieldMetadataItem: currentFieldMetadataItem } =
    useFieldMetadataItemById(currentFieldMetadataId ?? '');

  const nestedFieldCandidatesByFieldId = useMemo(() => {
    const candidatesByFieldId = new Map<string, FieldMetadataItem[]>();

    for (const fieldMetadataItem of allFieldWidgetFieldMetadataItems) {
      if (!isFieldWidgetEligibleNestedParentField(fieldMetadataItem)) {
        continue;
      }

      const relationTargetObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          fieldMetadataItem.relation?.targetObjectMetadata.id,
      );

      if (!isDefined(relationTargetObjectMetadataItem)) {
        continue;
      }

      const nestedFieldCandidates = getFieldWidgetEligibleNestedFields(
        relationTargetObjectMetadataItem,
      );

      if (nestedFieldCandidates.length > 0) {
        candidatesByFieldId.set(fieldMetadataItem.id, nestedFieldCandidates);
      }
    }

    return candidatesByFieldId;
  }, [allFieldWidgetFieldMetadataItems, objectMetadataItems]);

  // Keyboard focus carries over between the browse list and the drill-in
  // submenu since both share the dropdown's selectable list instance. Align
  // it on the checked option when entering the submenu, and back on the
  // parent row when leaving, so Enter never activates a stale row.
  const handleDrillIn = (fieldMetadataItem: FieldMetadataItem) => {
    setDrillInFieldMetadataItem(fieldMetadataItem);

    const isCheckedNestedFieldInCandidates =
      currentFieldMetadataId === fieldMetadataItem.id &&
      isDefined(currentNestedRelationFieldMetadataId) &&
      (nestedFieldCandidatesByFieldId.get(fieldMetadataItem.id) ?? []).some(
        (nestedFieldMetadataItem) =>
          nestedFieldMetadataItem.id === currentNestedRelationFieldMetadataId,
      );

    if (isCheckedNestedFieldInCandidates) {
      setSelectedItemId(currentNestedRelationFieldMetadataId);
    } else {
      resetSelectedItem();
    }
  };

  const handleDrillOut = (fieldMetadataItem: FieldMetadataItem) => {
    setDrillInFieldMetadataItem(null);
    setSelectedItemId(fieldMetadataItem.id);
  };

  const isSelectingDifferentChain = (
    fieldMetadataId: string,
    nestedRelationFieldMetadataId: string | null,
  ) =>
    currentFieldMetadataId !== fieldMetadataId ||
    (currentNestedRelationFieldMetadataId ?? null) !==
      nestedRelationFieldMetadataId;

  const handleSelectField = (selectedField: FieldMetadataItem) => {
    const currentDisplayMode = fieldConfiguration?.fieldDisplayMode;

    const needsDisplayModeSwitch =
      isDefined(currentDisplayMode) &&
      !isDisplayModeValidForFieldType(
        selectedField.type,
        currentDisplayMode,
        selectedField.relation?.type,
      );

    const nextDisplayMode = needsDisplayModeSwitch
      ? getFieldWidgetDefaultDisplayMode(selectedField.type)
      : currentDisplayMode;

    const relationTableViewIdChange =
      resolveFieldWidgetRelationTableViewIdChange({
        selectedField,
        nextDisplayMode,
        isSelectingDifferentChain: isSelectingDifferentChain(
          selectedField.id,
          null,
        ),
        widgetId: widgetInEditMode?.id,
        currentViewId: fieldConfiguration?.viewId,
      });

    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldMetadataId: selectedField.id,
        nestedRelationFieldMetadataId: null,
        ...relationTableViewIdChange,
        ...(needsDisplayModeSwitch && {
          fieldDisplayMode: nextDisplayMode,
        }),
      },
    });

    if (isDefined(widgetInEditMode)) {
      updatePageLayoutWidget(widgetInEditMode.id, {
        title: selectedField.label,
      });
    }

    closeDropdown();
  };

  const handleSelectNestedField = (
    parentFieldMetadataItem: FieldMetadataItem,
    nestedFieldMetadataItem: FieldMetadataItem,
  ) => {
    // A nested relation widget always renders as an embedded view, so the
    // effective display mode is TABLE regardless of the current one.
    const relationTableViewIdChange =
      resolveFieldWidgetRelationTableViewIdChange({
        selectedField: parentFieldMetadataItem,
        selectedNestedField: nestedFieldMetadataItem,
        nextDisplayMode: FieldDisplayMode.TABLE,
        isSelectingDifferentChain: isSelectingDifferentChain(
          parentFieldMetadataItem.id,
          nestedFieldMetadataItem.id,
        ),
        widgetId: widgetInEditMode?.id,
        currentViewId: fieldConfiguration?.viewId,
      });

    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldMetadataId: parentFieldMetadataItem.id,
        nestedRelationFieldMetadataId: nestedFieldMetadataItem.id,
        fieldDisplayMode: FieldDisplayMode.TABLE,
        ...relationTableViewIdChange,
      },
    });

    if (isDefined(widgetInEditMode)) {
      updatePageLayoutWidget(widgetInEditMode.id, {
        title: `${parentFieldMetadataItem.label} → ${nestedFieldMetadataItem.label}`,
      });
    }

    closeDropdown();
  };

  if (isDefined(drillInFieldMetadataItem)) {
    return (
      <FieldWidgetNestedFieldDropdownContent
        drillInFieldMetadataItem={drillInFieldMetadataItem}
        nestedFieldCandidates={
          nestedFieldCandidatesByFieldId.get(drillInFieldMetadataItem.id) ?? []
        }
        checkedItemId={
          currentFieldMetadataId === drillInFieldMetadataItem.id
            ? (currentNestedRelationFieldMetadataId ??
              drillInFieldMetadataItem.id)
            : undefined
        }
        onBack={() => handleDrillOut(drillInFieldMetadataItem)}
        onSelectField={handleSelectField}
        onSelectNestedField={handleSelectNestedField}
      />
    );
  }

  return (
    <StyledPageLayoutDropdownContentContainer>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search fields`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <StyledPageLayoutDropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={availableFields.map((field) => field.id)}
        >
          {availableFields.map((fieldMetadataItem) => {
            const hasNestedFieldCandidates = nestedFieldCandidatesByFieldId.has(
              fieldMetadataItem.id,
            );

            const handleClick = hasNestedFieldCandidates
              ? () => handleDrillIn(fieldMetadataItem)
              : () => handleSelectField(fieldMetadataItem);

            return (
              <SelectableListItem
                key={fieldMetadataItem.id}
                itemId={fieldMetadataItem.id}
                onEnter={handleClick}
              >
                <MenuItemSelect
                  text={fieldMetadataItem.label}
                  // Rows opening a submenu never show the checkmark: the
                  // selected chain is only visible inside the submenu, like
                  // the chart group by field selection.
                  selected={
                    !hasNestedFieldCandidates &&
                    currentFieldMetadataId === fieldMetadataItem.id
                  }
                  focused={selectedItemId === fieldMetadataItem.id}
                  LeftIcon={getIcon(
                    currentFieldMetadataId === fieldMetadataItem.id
                      ? currentFieldMetadataItem?.icon
                      : fieldMetadataItem.icon,
                  )}
                  hasSubMenu={hasNestedFieldCandidates}
                  onClick={handleClick}
                />
              </SelectableListItem>
            );
          })}
        </SelectableList>
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
