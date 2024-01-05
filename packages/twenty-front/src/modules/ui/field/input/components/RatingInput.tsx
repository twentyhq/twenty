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

const RATING_LEVELS_NB = 5;

export const RatingInput = ({
  onChange,
  value,
  readonly,
}: RatingInputProps) => {
  const theme = useTheme();
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const getRatingNumber = (fieldValue: FieldRatingValue) => {
    switch (fieldValue) {
      case FieldRatingValue.ONE:
        return 1;
      case FieldRatingValue.TWO:
        return 2;
      case FieldRatingValue.THREE:
        return 3;
      case FieldRatingValue.FOUR:
        return 4;
      case FieldRatingValue.FIVE:
        return 5;
      default:
        return 0;
    }
  };

  const getRatingEnum = (rating: number) => {
    switch (rating) {
      case 1:
        return FieldRatingValue.ONE;
      case 2:
        return FieldRatingValue.TWO;
      case 3:
        return FieldRatingValue.THREE;
      case 4:
        return FieldRatingValue.FOUR;
      case 5:
        return FieldRatingValue.FIVE;
      default:
        return FieldRatingValue.ZERO;
    }
  };

  const originalValue = getRatingNumber(value);
  const currentValue = hoveredValue ?? originalValue;

  return (
    <StyledContainer
      role="slider"
      aria-label="Rating"
      aria-valuemax={RATING_LEVELS_NB}
      aria-valuemin={1}
      aria-valuenow={originalValue}
      tabIndex={0}
    >
      {Array.from({ length: RATING_LEVELS_NB }, (_, index) => {
        const rating = index + 1;

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
