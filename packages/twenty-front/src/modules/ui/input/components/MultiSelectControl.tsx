import {
  type SelectControlProps,
  StyledControlContainer,
  StyledSelectControlIconChevronDown,
} from '@/ui/input/components/SelectControl';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import pluralize from 'pluralize';
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
};

export const MultiSelectControl = ({
  fixedIcon,
  fixedText,
  selectedOptions,
  isDisabled,
  selectSizeVariant,
  textAccent = 'default',
  hasRightElement,
}: MultiSelectControlProps) => {
  const theme = useTheme();

  if (selectedOptions.length === 0) {
    return null;
  }

  const firstSelectedOption = selectedOptions[0];
  const selectedOptionsCount = selectedOptions.length;
  return (
    <StyledControlContainer
      disabled={isDisabled}
      hasIcon={isDefined(fixedIcon) || isDefined(firstSelectedOption.Icon)}
      selectSizeVariant={selectSizeVariant}
      textAccent={textAccent}
      hasRightElement={hasRightElement}
    >
      {isDefined(fixedIcon) ? (
        React.createElement(fixedIcon, {
          color: isDisabled ? theme.font.color.light : theme.font.color.primary,
          size: theme.icon.size.md,
          stroke: theme.icon.stroke.sm,
        })
      ) : isDefined(firstSelectedOption.Icon) ? (
        <firstSelectedOption.Icon
          color={isDisabled ? theme.font.color.light : theme.font.color.primary}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      ) : null}
      {isDefined(fixedText) ? (
        <OverflowingTextWithTooltip
          text={t`${selectedOptionsCount} ${
            selectedOptionsCount <= 1 ? fixedText : pluralize(fixedText)
          }`}
        />
      ) : (
        <OverflowingTextWithTooltip text={firstSelectedOption.label} />
      )}

      <StyledSelectControlIconChevronDown
        disabled={isDisabled}
        size={theme.icon.size.md}
      />
    </StyledControlContainer>
  );
};
