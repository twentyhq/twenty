import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { FieldRatingValue } from '@/object-record/record-field/types/FieldMetadata';
import { RatingInput } from '@/ui/field/input/components/RatingInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

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
  const {
    selectedOperandInDropdownState,
    filterDefinitionUsedInDropdownState,
    selectedFilterState,
    selectFilter,
  } = useFilterDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState);

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

            selectFilter?.({
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
