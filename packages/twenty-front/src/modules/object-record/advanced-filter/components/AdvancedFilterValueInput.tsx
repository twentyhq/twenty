import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { AdvancedFilterDropdownFilterInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownFilterInput';
import { AdvancedFilterDropdownTextInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownTextInput';
import { AdvancedFilterValueInputDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterValueInputDropdownButtonClickableSelect';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { shouldShowFilterTextInput } from '@/object-record/advanced-filter/utils/shouldShowFilterTextInput';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

const StyledValueDropdownContainer = styled.div`
  flex: 3;
`;

type AdvancedFilterValueInputProps = {
  recordFilterId: string;
};

export const AdvancedFilterValueInput = ({
  recordFilterId,
}: AdvancedFilterValueInputProps) => {
  const dropdownId = `advanced-filter-view-filter-value-input-${recordFilterId}`;

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const subFieldNameUsedInDropdown = useAtomComponentStateValue(
    subFieldNameUsedInDropdownComponentState,
    dropdownId,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !recordFilter?.fieldMetadataId || !recordFilter.operand;

  const setObjectFilterDropdownSearchInput = useSetAtomComponentState(
    objectFilterDropdownSearchInputComponentState,
    dropdownId,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
    dropdownId,
  );

  const setObjectFilterDropdownCurrentRecordFilter = useSetAtomComponentState(
    objectFilterDropdownCurrentRecordFilterComponentState,
    dropdownId,
  );

  const { fieldMetadataItem: filterFieldItem } = useFieldMetadataItemById(
    recordFilter?.fieldMetadataId ?? '',
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  const operandHasNoInput =
    recordFilter && !configurableViewFilterOperands.has(recordFilter.operand);

  if (!isDefined(recordFilter)) {
    return null;
  }

  const handleFilterValueDropdownClose = () => {
    setObjectFilterDropdownSearchInput('');
  };

  const handleFilterValueDropdownOpen = () => {
    setObjectFilterDropdownCurrentRecordFilter(recordFilter);

    // For ONE_TO_MANY sub-field filters, use the target field's ID
    // so the value input resolves the correct field metadata
    if (
      isNonEmptyString(recordFilter.subFieldName) &&
      filterFieldItem?.type === FieldMetadataType.RELATION &&
      filterFieldItem.relation?.type === RelationType.ONE_TO_MANY
    ) {
      const targetObject = objectMetadataItems.find(
        (o) => o.id === filterFieldItem.relation?.targetObjectMetadata.id,
      );
      const targetField = targetObject?.fields.find(
        (f) => f.name === recordFilter.subFieldName,
      );

      if (isDefined(targetField)) {
        setFieldMetadataItemIdUsedInDropdown(targetField.id);

        return;
      }
    }

    setFieldMetadataItemIdUsedInDropdown(recordFilter.fieldMetadataId);
  };

  const filterType = recordFilter.type;

  const dropdownContentOffset =
    filterType === 'DATE' || filterType === 'DATE_TIME'
      ? ({ y: -33, x: 0 } satisfies DropdownOffset)
      : DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET;

  const showFilterTextInputInsteadOfDropdown = shouldShowFilterTextInput({
    recordFilter,
    subFieldNameUsedInDropdown,
  });

  return (
    <StyledValueDropdownContainer>
      {operandHasNoInput ? (
        <></>
      ) : isDisabled ? (
        <AdvancedFilterValueInputDropdownButtonClickableSelect
          recordFilterId={recordFilterId}
        />
      ) : showFilterTextInputInsteadOfDropdown ? (
        <AdvancedFilterDropdownTextInput recordFilter={recordFilter} />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <AdvancedFilterValueInputDropdownButtonClickableSelect
              recordFilterId={recordFilterId}
            />
          }
          dropdownComponents={
            <AdvancedFilterDropdownFilterInput
              recordFilter={recordFilter}
              filterDropdownId={dropdownId}
            />
          }
          dropdownOffset={dropdownContentOffset}
          dropdownPlacement="bottom-start"
          onClose={handleFilterValueDropdownClose}
          onOpen={handleFilterValueDropdownOpen}
        />
      )}
    </StyledValueDropdownContainer>
  );
};
