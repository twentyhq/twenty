import {
  type SelectControlProps,
  StyledControlContainer,
  StyledSelectControlIconChevronDown,
} from '@/ui/input/components/SelectControl';
import { useTheme } from '@emotion/react';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';

type MultiSelectOptionType = {
  label: string;
  Icon: IconComponent;
};

type MultiSelectControlProps = Omit<SelectControlProps, 'selectedOption'> & {
  fixedIcon?: IconComponent;
  fixedText?: string;
  selectedOptions: MultiSelectOptionType[];
  placeholderText?: string;
};

export const MultiSelectControl = ({
  fixedIcon,
  fixedText,
  selectedOptions,
  isDisabled,
  selectSizeVariant,
  textAccent = 'default',
  hasRightElement,
  placeholderText,
}: MultiSelectControlProps) => {
  const theme = useTheme();

  const firstSelectedOption = selectedOptions[0];
  const hasSelection = selectedOptions.length > 0;

  return (
    <StyledControlContainer
      disabled={isDisabled}
      hasIcon={
        isDefined(fixedIcon) ||
        (hasSelection && isDefined(firstSelectedOption?.Icon))
      }
      selectSizeVariant={selectSizeVariant}
      textAccent={hasSelection ? textAccent : 'placeholder'}
      hasRightElement={hasRightElement}
    >
      {isDefined(fixedIcon) ? (
        React.createElement(fixedIcon, {
          color: isDisabled ? theme.font.color.light : theme.font.color.primary,
          size: theme.icon.size.md,
          stroke: theme.icon.stroke.sm,
        })
      ) : hasSelection && isDefined(firstSelectedOption.Icon) ? (
        <firstSelectedOption.Icon
          color={isDisabled ? theme.font.color.light : theme.font.color.primary}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      ) : null}
      {isDefined(fixedText) ? (
        <OverflowingTextWithTooltip text={fixedText} />
      ) : hasSelection ? (
        <OverflowingTextWithTooltip text={firstSelectedOption.label} />
      ) : isDefined(placeholderText) ? (
        <OverflowingTextWithTooltip text={placeholderText} />
      ) : null}

      <StyledSelectControlIconChevronDown
        disabled={isDisabled}
        size={theme.icon.size.md}
      />
    </StyledControlContainer>
  );
};
