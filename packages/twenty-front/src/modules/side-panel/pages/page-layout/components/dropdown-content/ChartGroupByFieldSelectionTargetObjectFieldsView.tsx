import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { ChartGroupByFieldSelectionCompositeFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { isFieldSupportedAsChartGroupBySubField } from '@/side-panel/pages/page-layout/utils/isFieldSupportedAsChartGroupBySubField';
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
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const RECORD_ITEM_ID = 'record';

type ChartGroupByFieldSelectionTargetObjectFieldsViewProps = {
  targetObjectNameSingular?: string;
  headerLabel: string;
  currentSubFieldName: string | undefined;
  isCurrentGroupByField: boolean;
  onBack: () => void;
  onSelectSubField: (subFieldName: string) => void;
  onSelectRecord: () => void;
};

export const ChartGroupByFieldSelectionTargetObjectFieldsView = ({
  targetObjectNameSingular,
  headerLabel,
  currentSubFieldName,
  isCurrentGroupByField,
  onBack,
  onSelectSubField,
  onSelectRecord,
}: ChartGroupByFieldSelectionTargetObjectFieldsViewProps) => {
  const { getIcon } = useIcons();

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCompositeField, setSelectedCompositeField] =
    useState<FieldMetadataItem | null>(null);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

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
        isFieldSupportedAsChartGroupBySubField,
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

  const recordOptionLabel = t`Record`;

  const isRecordOptionVisible = normalizeSearchText(recordOptionLabel).includes(
    normalizeSearchText(searchQuery),
  );

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
        {headerLabel}
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
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={[
            ...(isRecordOptionVisible ? [RECORD_ITEM_ID] : []),
            ...availableFields.map((field) => field.id),
          ]}
        >
          {isRecordOptionVisible && (
            <SelectableListItem
              itemId={RECORD_ITEM_ID}
              onEnter={onSelectRecord}
            >
              <DropdownListItem
                focused={selectedItemId === RECORD_ITEM_ID}
                onClick={onSelectRecord}
                role="option"
                aria-selected={
                  isCurrentGroupByField && !isDefined(currentSubFieldName)
                }
                selected={
                  isCurrentGroupByField && !isDefined(currentSubFieldName)
                }
                indicator="check"
                startIcon={
                  <SelectOptionIcon
                    Icon={getIcon(targetObjectMetadataItem?.icon)}
                  />
                }
              >
                {recordOptionLabel}
              </DropdownListItem>
            </SelectableListItem>
          )}
          {availableFields.length === 0 && !isRecordOptionVisible ? (
            <DropdownListItem
              disabled
            >{t`No fields available`}</DropdownListItem>
          ) : (
            availableFields.map((fieldMetadataItem) => (
              <SelectableListItem
                key={fieldMetadataItem.id}
                itemId={fieldMetadataItem.id}
                onEnter={() => {
                  handleSelectField(fieldMetadataItem);
                }}
              >
                <DropdownListItem
                  focused={selectedItemId === fieldMetadataItem.id}
                  onClick={() => {
                    handleSelectField(fieldMetadataItem);
                  }}
                  role="option"
                  aria-selected={
                    !isCompositeFieldType(fieldMetadataItem.type) &&
                    currentNestedFieldName === fieldMetadataItem.name
                  }
                  selected={
                    !isCompositeFieldType(fieldMetadataItem.type) &&
                    currentNestedFieldName === fieldMetadataItem.name
                  }
                  indicator="check"
                  hasSubmenu={isCompositeFieldType(fieldMetadataItem.type)}
                  startIcon={
                    <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
                  }
                >
                  {fieldMetadataItem.label}
                </DropdownListItem>
              </SelectableListItem>
            ))
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
