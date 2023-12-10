import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

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
  onChange: (newValue: number) => void;
  value: number;
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
  const currentValue = hoveredValue ?? value;

  return (
    <StyledContainer
      role="slider"
      aria-label="Rating"
      aria-valuemax={RATING_LEVELS_NB}
      aria-valuemin={1}
      aria-valuenow={value}
      tabIndex={0}
    >
      {Array.from({ length: RATING_LEVELS_NB }, (_, index) => {
        const rating = index + 1;

        return (
          <StyledRatingIconContainer
            key={index}
            isActive={rating <= currentValue}
            onClick={readonly ? undefined : () => onChange(rating)}
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
