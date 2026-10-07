import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { DashboardFilterBindingRelationTargetFieldsView } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterBindingRelationTargetFieldsView';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const NOT_APPLIED_ITEM_ID = 'not-applied';
const ID_FIELD_NAME = 'id';

type DashboardFilterBindingFieldDropdownContentProps = {
  slot: DashboardFilterSlot;
  slotRelationTargetObjectMetadataId: string | undefined;
  objectMetadataItem: EnrichedObjectMetadataItem;
  binding: DashboardFilterBinding | null;
  onBindingChange: (binding: DashboardFilterBinding | null) => void;
};

// Only fields of the slot's own filter type are offered, so rebinding a widget can never change what the chip edits.
export const DashboardFilterBindingFieldDropdownContent = ({
  slot,
  slotRelationTargetObjectMetadataId,
  objectMetadataItem,
  binding,
  onBindingChange,
}: DashboardFilterBindingFieldDropdownContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRelationField, setSelectedRelationField] =
    useState<FieldMetadataItem | null>(null);

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const isJsonFilterEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_JSON_FILTER_ENABLED,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const isFilterableField = getFilterFilterableFieldMetadataItems({
    isJsonFilterEnabled,
  });

  const filterableFields = objectMetadataItem.fields.filter(isFilterableField);

  const isRelationSlot = slot.filterType === 'RELATION';

  const getTargetFieldsOfSlotType = (
    relationField: FieldMetadataItem,
  ): FieldMetadataItem[] => {
    if (!isManyToOneRelationField(relationField)) {
      return [];
    }

    const targetObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === relationField.relation.targetObjectMetadata.id,
    );

    return (
      targetObjectMetadataItem?.fields
        .filter(isFilterableField)
        .filter(
          (field) =>
            field.name !== ID_FIELD_NAME &&
            getFilterTypeFromFieldType(field.type) === slot.filterType,
        ) ?? []
    );
  };

  const directFields = filterableFields.filter((field) => {
    if (isRelationSlot) {
      if (field.name === ID_FIELD_NAME) {
        return objectMetadataItem.id === slotRelationTargetObjectMetadataId;
      }

      return (
        isManyToOneRelationField(field) &&
        (!isDefined(slotRelationTargetObjectMetadataId) ||
          field.relation.targetObjectMetadata.id ===
            slotRelationTargetObjectMetadataId)
      );
    }

    return (
      field.name !== ID_FIELD_NAME &&
      getFilterTypeFromFieldType(field.type) === slot.filterType
    );
  });

  const relationFieldsWithTargetFields = isRelationSlot
    ? []
    : filterableFields.filter(
        (field) =>
          isManyToOneRelationField(field) &&
          getTargetFieldsOfSlotType(field).length > 0,
      );

  const visibleDirectFields = filterBySearchQuery({
    items: directFields,
    searchQuery,
    getSearchableValues: (field) => [field.label, field.name],
  });

  const visibleRelationFields = filterBySearchQuery({
    items: relationFieldsWithTargetFields,
    searchQuery,
    getSearchableValues: (field) => [field.label, field.name],
  });

  const handleSelectNotApplied = () => {
    onBindingChange(null);
    closeDropdown();
  };

  const handleSelectField = (field: FieldMetadataItem) => {
    onBindingChange({ fieldMetadataId: field.id });
    closeDropdown();
  };

  const handleSelectRelationTargetField = (
    relationTargetField: FieldMetadataItem,
  ) => {
    if (!isDefined(selectedRelationField)) {
      return;
    }

    onBindingChange({
      fieldMetadataId: selectedRelationField.id,
      relationTargetFieldMetadataId: relationTargetField.id,
    });
    closeDropdown();
  };

  if (isDefined(selectedRelationField)) {
    return (
      <DashboardFilterBindingRelationTargetFieldsView
        relationField={selectedRelationField}
        targetFields={getTargetFieldsOfSlotType(selectedRelationField)}
        currentRelationTargetFieldMetadataId={
          binding?.fieldMetadataId === selectedRelationField.id
            ? binding.relationTargetFieldMetadataId
            : undefined
        }
        onBack={() => setSelectedRelationField(null)}
        onSelectTargetField={handleSelectRelationTargetField}
      />
    );
  }

  const isDirectFieldSelected = (field: FieldMetadataItem) =>
    binding?.fieldMetadataId === field.id &&
    !isDefined(binding.relationTargetFieldMetadataId);

  const isRelationFieldSelected = (field: FieldMetadataItem) =>
    binding?.fieldMetadataId === field.id &&
    isDefined(binding.relationTargetFieldMetadataId);

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
          selectableItemIdArray={[
            NOT_APPLIED_ITEM_ID,
            ...visibleDirectFields.map((field) => field.id),
            ...visibleRelationFields.map((field) => field.id),
          ]}
        >
          <SelectableListItem
            itemId={NOT_APPLIED_ITEM_ID}
            onEnter={handleSelectNotApplied}
          >
            <ListItem
              focused={selectedItemId === NOT_APPLIED_ITEM_ID}
              onClick={handleSelectNotApplied}
              role="option"
              aria-selected={!isDefined(binding)}
              selected={!isDefined(binding)}
              indicator="check"
            >
              {t`Not applied`}
            </ListItem>
          </SelectableListItem>
          {visibleDirectFields.map((field) => (
            <SelectableListItem
              key={field.id}
              itemId={field.id}
              onEnter={() => handleSelectField(field)}
            >
              <ListItem
                focused={selectedItemId === field.id}
                onClick={() => handleSelectField(field)}
                role="option"
                aria-selected={isDirectFieldSelected(field)}
                selected={isDirectFieldSelected(field)}
                indicator="check"
                startIcon={<SelectOptionIcon Icon={getIcon(field.icon)} />}
              >
                {field.name === ID_FIELD_NAME ? t`Record` : field.label}
              </ListItem>
            </SelectableListItem>
          ))}
          {visibleRelationFields.map((field) => (
            <SelectableListItem
              key={field.id}
              itemId={field.id}
              onEnter={() => setSelectedRelationField(field)}
            >
              <ListItem
                focused={selectedItemId === field.id}
                onClick={() => setSelectedRelationField(field)}
                role="option"
                aria-selected={isRelationFieldSelected(field)}
                selected={isRelationFieldSelected(field)}
                indicator="check"
                hasSubmenu
                startIcon={<SelectOptionIcon Icon={getIcon(field.icon)} />}
              >
                {field.label}
              </ListItem>
            </SelectableListItem>
          ))}
        </SelectableList>
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
