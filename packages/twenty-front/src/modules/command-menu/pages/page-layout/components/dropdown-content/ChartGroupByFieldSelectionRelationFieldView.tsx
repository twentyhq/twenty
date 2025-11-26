import { ChartGroupByFieldSelectionCompositeFieldView } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

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

    return targetObjectMetadataItem.fields.filter(
      (field) => !field.isSystem && !isFieldRelation(field),
    );
  }, [targetObjectMetadataItem]);

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

  const currentNestedFieldName = currentSubFieldName?.split('.')[0];
  const currentNestedSubFieldName = currentSubFieldName?.split('.')[1];

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
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
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
      </DropdownMenuItemsContainer>
    </>
  );
};
