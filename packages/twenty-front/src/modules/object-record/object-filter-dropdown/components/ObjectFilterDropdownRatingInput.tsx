import { v4 } from 'uuid';

import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { FieldRatingValue } from '@/object-record/record-field/types/FieldMetadata';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { RatingInput } from '@/ui/field/input/components/RatingInput';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import styled from '@emotion/styled';

const StyledRatingInputContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

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

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  return (
    fieldMetadataItemUsedInDropdown &&
    selectedOperandInDropdown && (
      <StyledRatingInputContainer>
        <RatingInput
          value={selectedFilter?.value as FieldRatingValue}
          onChange={(newValue: FieldRatingValue) => {
            if (!newValue) {
              return;
            }

            applyRecordFilter?.({
              id: selectedFilter?.id ? selectedFilter.id : v4(),
              fieldMetadataId: fieldMetadataItemUsedInDropdown.id,
              value: convertFieldRatingValueToNumber(newValue),
              operand: selectedOperandInDropdown,
              displayValue: convertFieldRatingValueToNumber(newValue),
              recordFilterGroupId: selectedFilter?.recordFilterGroupId,
              positionInRecordFilterGroup:
                selectedFilter?.positionInRecordFilterGroup,
              type: getFilterTypeFromFieldType(
                fieldMetadataItemUsedInDropdown.type,
              ),
              label: fieldMetadataItemUsedInDropdown.label,
              subFieldName: selectedFilter?.subFieldName,
            });
          }}
        />
      </StyledRatingInputContainer>
    )
  );
};
