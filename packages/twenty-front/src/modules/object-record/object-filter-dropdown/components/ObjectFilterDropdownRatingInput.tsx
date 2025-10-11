import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { RatingInput } from '@/ui/field/input/components/RatingInput';
import styled from '@emotion/styled';
import { RATING_VALUES } from 'twenty-shared/constants';
import { type FieldRatingValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const StyledRatingInputContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

const convertFieldRatingValueToNumber = (
  rating: Exclude<FieldRatingValue, null>,
): string => rating.split('_')[1];

export const convertGreaterThanOrEqualRatingToArrayOfRatingValues = (
  greaterThanValue: number,
) =>
  RATING_VALUES.filter(
    (ratingValue) => +ratingValue.split('_')[1] >= greaterThanValue,
  );

export const convertLessThanOrEqualRatingToArrayOfRatingValues = (
  lessThanValue: number,
) =>
  RATING_VALUES.filter(
    (ratingValue) => +ratingValue.split('_')[1] <= lessThanValue,
  );

export const convertRatingToRatingValue = (rating: number) =>
  `RATING_${rating}` as FieldRatingValue;

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

  const currentFilterValueConvertedToRatingValue = isDefined(
    objectFilterDropdownFilterValue,
  )
    ? convertRatingToRatingValue(Number(objectFilterDropdownFilterValue))
    : null;

  return (
    <StyledRatingInputContainer>
      <RatingInput
        value={currentFilterValueConvertedToRatingValue}
        onChange={handleInputChange}
      />
    </StyledRatingInputContainer>
  );
};
