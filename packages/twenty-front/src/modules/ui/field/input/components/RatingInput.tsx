import { useContext, useState } from 'react';
import { styled } from '@linaria/react';
import { IconTwentyStarFilled, THEME_COMMON, ThemeContext } from 'twenty-ui';

import { RATING_VALUES } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { FieldRatingValue } from '@/object-record/record-field/types/FieldMetadata';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledRatingIconContainer = styled.div<{
  color: string;
}>`
  color: ${({ color }) => color};
  display: inline-flex;
`;

type RatingInputProps = {
  onChange?: (newValue: FieldRatingValue) => void;
  value: FieldRatingValue;
  readonly?: boolean;
};

const iconSizeMd = THEME_COMMON.icon.size.md;

export const RatingInput = ({
  onChange,
  value,
  readonly,
}: RatingInputProps) => {
  const { theme } = useContext(ThemeContext);

  const activeColor = theme.font.color.secondary;
  const inactiveColor = theme.background.quaternary;

  const [hoveredValue, setHoveredValue] = useState<FieldRatingValue | null>(
    null,
  );
  const currentValue = hoveredValue ?? value;

  const selectedIndex = RATING_VALUES.indexOf(currentValue);

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
        const isActive = index <= selectedIndex;

        return (
          <StyledRatingIconContainer
            key={index}
            color={isActive ? activeColor : inactiveColor}
            onClick={readonly ? undefined : () => onChange?.(value)}
            onMouseEnter={readonly ? undefined : () => setHoveredValue(value)}
            onMouseLeave={readonly ? undefined : () => setHoveredValue(null)}
          >
            <IconTwentyStarFilled size={iconSizeMd} />
          </StyledRatingIconContainer>
        );
      })}
    </StyledContainer>
  );
};
