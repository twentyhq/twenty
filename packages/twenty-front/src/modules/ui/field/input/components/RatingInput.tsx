import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldRatingValue } from '@/object-record/field/types/FieldMetadata';
import { IconTwentyStarFilled } from '@/ui/display/icon/components/IconTwentyStarFilled';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledRatingIconContainer = styled.div<{ isActive?: boolean }>`
  color: ${({ isActive, theme }) =>
    isActive ? theme.font.color.secondary : theme.background.quaternary};
  display: inline-flex;
`;

type RatingInputProps = {
  onChange: (newValue: FieldRatingValue) => void;
  value: FieldRatingValue;
  readonly?: boolean;
};

export const RatingInput = ({
  onChange,
  value,
  readonly,
}: RatingInputProps) => {
  const theme = useTheme();
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const ratings: { rating: number; enum: FieldRatingValue }[] = [
    {
      rating: 1,
      enum: FieldRatingValue.ONE,
    },
    {
      rating: 2,
      enum: FieldRatingValue.TWO,
    },
    {
      rating: 3,
      enum: FieldRatingValue.THREE,
    },
    {
      rating: 4,
      enum: FieldRatingValue.FOUR,
    },
    {
      rating: 5,
      enum: FieldRatingValue.FIVE,
    },
  ];

  const getRatingNumber = (fieldValue: FieldRatingValue) => {
    const ratingObj = ratings.find((obj) => obj.enum === fieldValue);
    if (ratingObj) return ratingObj.rating;
    else return 0;
  };

  const getRatingEnum = (rating: number) => {
    const ratingObj = ratings.find((obj) => obj.rating === rating);
    if (ratingObj) return ratingObj.enum;
    else return FieldRatingValue.ZERO;
  };

  const originalRating = getRatingNumber(value);
  const currentValue = hoveredValue ?? originalRating;

  return (
    <StyledContainer
      role="slider"
      aria-label="Rating"
      aria-valuemax={ratings.length}
      aria-valuemin={1}
      aria-valuenow={originalRating}
      tabIndex={0}
    >
      {ratings.map(({ rating }, index) => {
        return (
          <StyledRatingIconContainer
            key={index}
            isActive={rating <= currentValue}
            onClick={
              readonly ? undefined : () => onChange(getRatingEnum(rating))
            }
            onMouseEnter={readonly ? undefined : () => setHoveredValue(rating)}
            onMouseLeave={readonly ? undefined : () => setHoveredValue(null)}
          >
            <IconTwentyStarFilled size={theme.icon.size.md} />
          </StyledRatingIconContainer>
        );
      })}
    </StyledContainer>
  );
};
