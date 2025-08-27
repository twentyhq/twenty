import { StyledContainer } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { RATING_VALUES } from '@/object-record/record-field/ui/constants/RatingValues';
import { type FieldRatingValue } from '@/object-record/record-field/ui/types/FieldRatingValue';
import { useContext, useState } from 'react';
import {
  ColorableIconContainer,
  IconTwentyStarFilled,
} from 'twenty-ui/display';

import { THEME_COMMON, ThemeContext } from 'twenty-ui/theme';

type BaseRatingInputProps = {
  onChange?: (newValue: FieldRatingValue) => void;
  value: FieldRatingValue;
  readonly?: boolean;
};

const iconSizeMd = THEME_COMMON.icon.size.md;

export const BaseRatingInput = ({
  onChange,
  value,
  readonly,
}: BaseRatingInputProps) => {
  const { theme } = useContext(ThemeContext);

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
    }

    onChange?.(newValue);
  };

  return (
    <StyledContainer
      role="slider"
      aria-label="Rating"
      aria-valuemax={RATING_VALUES.length}
      aria-valuemin={1}
      aria-valuenow={selectedIndex + 1}
      tabIndex={0}
    >
      {RATING_VALUES.map((value, index) => {
        const isActive = index <= selectedIndex;

        return (
          <ColorableIconContainer
            key={index}
            color={isActive ? activeColor : inactiveColor}
            onClick={() => handleClick(value)}
            onMouseEnter={readonly ? undefined : () => setHoveredValue(value)}
            onMouseLeave={readonly ? undefined : () => setHoveredValue(null)}
          >
            <IconTwentyStarFilled size={iconSizeMd} />
          </ColorableIconContainer>
        );
      })}
    </StyledContainer>
  );
};
