import { ChartGroupByFieldSelectionCompositeFieldView } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ChartGroupByFieldSelectionRelationFieldViewProps = {
  relationField: FieldMetadataItem;
  currentSubFieldName: string | undefined;
  onBack: () => void;
  onSelectSubField: (subFieldName: string) => void;
};

export const ChartGroupByFieldSelectionRelationFieldView = ({
  relationField,
  currentSubFieldName,
  onBack,
  onSelectSubField,
}: ChartGroupByFieldSelectionRelationFieldViewProps) => {
  const { getIcon } = useIcons();

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCompositeField, setSelectedCompositeField] =
    useState<FieldMetadataItem | null>(null);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const targetObjectNameSingular =
    relationField.relation?.targetObjectMetadata?.nameSingular;

  const targetObjectMetadataItem = useMemo(
    () =>
      objectMetadataItems.find(
        (item) => item.nameSingular === targetObjectNameSingular,
      ),
    [objectMetadataItems, targetObjectNameSingular],
  );

  const availableFields = useMemo(() => {
    if (!isDefined(targetObjectMetadataItem)) {
      return [];
    }

    return filterBySearchQuery({
      items: targetObjectMetadataItem.fields.filter(
        (field) => !field.isSystem && !isFieldRelation(field),
      ),
      searchQuery,
      getSearchableValues: (field) => [field.label, field.name],
    });
  }, [targetObjectMetadataItem, searchQuery]);

  const handleSelectField = (fieldMetadataItem: FieldMetadataItem) => {
    if (isCompositeFieldType(fieldMetadataItem.type)) {
      setSelectedCompositeField(fieldMetadataItem);
    } else {
      onSelectSubField(fieldMetadataItem.name);
    }
  };

  const handleSelectCompositeSubField = (compositeSubFieldName: string) => {
    if (!isDefined(selectedCompositeField)) {
      return;
    }
    onSelectSubField(`${selectedCompositeField.name}.${compositeSubFieldName}`);
  };

  const handleBackFromComposite = () => {
    setSelectedCompositeField(null);
  };

  const [currentNestedFieldName, currentNestedSubFieldName] =
    currentSubFieldName?.split('.') ?? [];

  if (isDefined(selectedCompositeField)) {
    return (
      <ChartGroupByFieldSelectionCompositeFieldView
        compositeField={selectedCompositeField}
        currentSubFieldName={currentNestedSubFieldName}
        onBack={handleBackFromComposite}
        onSelectSubField={handleSelectCompositeSubField}
      />
    );
  }

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
        {relationField.label}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search fields`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {availableFields.length === 0 ? (
          <MenuItem text={t`No fields available`} />
        ) : (
          <SelectableList
            selectableListInstanceId={dropdownId}
            focusId={dropdownId}
            selectableItemIdArray={availableFields.map((field) => field.id)}
          >
            {availableFields.map((fieldMetadataItem) => (
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
                    currentNestedFieldName === fieldMetadataItem.name
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
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
