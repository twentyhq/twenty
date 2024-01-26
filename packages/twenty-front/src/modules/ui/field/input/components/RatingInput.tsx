import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { RATING_VALUES } from '@/object-record/field/meta-types/input/components/RatingFieldInput';
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
  const [hoveredValue, setHoveredValue] = useState<FieldRatingValue | null>(
    null,
  );
  const currentValue = hoveredValue ?? value;

  return (
    <StyledContainer
      role="slider"
      aria-label="Rating"
      aria-valuemax={RATING_VALUES.length}
      aria-valuemin={1}
      aria-valuenow={RATING_VALUES.indexOf(currentValue) + 1}
      tabIndex={0}
    >
      {RATING_VALUES.map((value, index) => {
        const currentIndex = RATING_VALUES.indexOf(currentValue);

        return (
          <StyledRatingIconContainer
            key={index}
            isActive={index <= currentIndex}
            onClick={readonly ? undefined : () => onChange(value)}
            onMouseEnter={readonly ? undefined : () => setHoveredValue(value)}
            onMouseLeave={readonly ? undefined : () => setHoveredValue(null)}
          >
            <IconTwentyStarFilled size={theme.icon.size.md} />
          </StyledRatingIconContainer>
        );
      })}
    </StyledContainer>
  );
};
