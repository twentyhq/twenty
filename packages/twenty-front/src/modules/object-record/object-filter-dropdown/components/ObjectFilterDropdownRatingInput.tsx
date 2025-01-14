import { v4 } from 'uuid';

import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { FieldRatingValue } from '@/object-record/record-field/types/FieldMetadata';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { RatingInput } from '@/ui/field/input/components/RatingInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
const convertFieldRatingValueToNumber = (
  rating: Exclude<FieldRatingValue, null>,
): string => {
  return rating.split('_')[1];
};

export const convertGreaterThanRatingToArrayOfRatingValues = (
  greaterThanValue: number,
) => {
  return RATING_VALUES.filter((_, index) => index + 1 > greaterThanValue);
};

export const convertLessThanRatingToArrayOfRatingValues = (
  lessThanValue: number,
) => {
  return RATING_VALUES.filter((_, index) => index + 1 <= lessThanValue);
};

export const convertRatingToRatingValue = (rating: number) => {
  return `RATING_${rating}`;
};

export const ObjectFilterDropdownRatingInput = () => {
  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const filterDefinitionUsedInDropdown = useRecoilComponentValueV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuItemsContainer>
        <RatingInput
          value={selectedFilter?.value as FieldRatingValue}
          onChange={(newValue: FieldRatingValue) => {
            if (!newValue) {
              return;
            }

            applyRecordFilter?.({
              id: selectedFilter?.id ? selectedFilter.id : v4(),
              fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
              value: convertFieldRatingValueToNumber(newValue),
              operand: selectedOperandInDropdown,
              displayValue: convertFieldRatingValueToNumber(newValue),
              definition: filterDefinitionUsedInDropdown,
              viewFilterGroupId: selectedFilter?.viewFilterGroupId,
            });
          }}
        />
      </DropdownMenuItemsContainer>
    )
  );
};
