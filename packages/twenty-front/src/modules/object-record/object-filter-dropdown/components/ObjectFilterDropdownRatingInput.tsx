import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { FieldRatingValue } from '@/object-record/record-field/types/FieldMetadata';
import { RatingInput } from '@/ui/field/input/components/RatingInput';

import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
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
  return `RATING_${rating}` as FieldRatingValue;
};

export const ObjectFilterDropdownRatingInput = () => {
  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const { objectFilterDropdownFilterValue } =
    useObjectFilterDropdownFilterValue();

  const handleInputChange = (newRatingValue: FieldRatingValue) => {
    if (!newRatingValue) {
      return;
    }

    const ratingValueConverted =
      convertFieldRatingValueToNumber(newRatingValue);

    applyObjectFilterDropdownFilterValue(ratingValueConverted);
  };

  const currentFilterValueConvertedToRatingValue = convertRatingToRatingValue(
    Number(objectFilterDropdownFilterValue),
  );

  return (
    <StyledRatingInputContainer>
      <RatingInput
        value={currentFilterValueConvertedToRatingValue}
        onChange={handleInputChange}
      />
    </StyledRatingInputContainer>
  );
};
