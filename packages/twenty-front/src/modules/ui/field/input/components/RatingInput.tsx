import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useContext, useState } from 'react';

import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { RATING_VALUES } from 'twenty-shared/constants';
import { type FieldRatingValue } from 'twenty-shared/types';
import { IconTwentyStarFilled } from 'twenty-ui/display';
import { THEME_COMMON, ThemeContext } from 'twenty-ui/theme';

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
  const clearField = useClearField();

  const activeColor = theme.font.color.secondary;
  const inactiveColor = theme.background.quaternary;

  const [hoveredValue, setHoveredValue] = useState<FieldRatingValue>(null);

  const currentValue = hoveredValue ?? value;

  const selectedIndex =
    currentValue !== null ? RATING_VALUES.indexOf(currentValue) : -1;

  const canClick = !readonly;

  const handleClick = (newValue: FieldRatingValue) => {
    if (!canClick) return;
    if (newValue === value) {
      setHoveredValue(null);
      clearField();
    } else {
      onChange?.(newValue);
    }
  };

  return (
    <StyledContainer
      role="slider"
      aria-label={t`Rating`}
      aria-valuemax={RATING_VALUES.length}
      aria-valuemin={1}
      aria-valuenow={selectedIndex + 1}
      tabIndex={0}
    >
      {RATING_VALUES.map((value, index) => {
        const isActive = index <= selectedIndex;

        return (
          <StyledRatingIconContainer
            key={index}
            color={isActive ? activeColor : inactiveColor}
            onClick={() => handleClick(value)}
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
