import {
  type SelectControlProps,
  StyledControlContainer,
} from '@/ui/input/components/SelectControl';
import { styled } from '@linaria/react';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledIconChevronDownWrapper = styled.div<{
  disabled?: boolean;
}>`
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

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
  const firstSelectedOption = selectedOptions?.[0];
  return (
    <StyledControlContainer
      disabled={isDisabled}
      hasIcon={isDefined(fixedIcon) || isDefined(firstSelectedOption?.Icon)}
      selectSizeVariant={selectSizeVariant}
      textAccent={textAccent}
      hasRightElement={hasRightElement}
    >
      {isDefined(fixedIcon) ? (
        React.createElement(fixedIcon, {
          color: resolveThemeVariable(
            isDisabled
              ? themeCssVariables.font.color.light
              : themeCssVariables.font.color.primary,
          ),
          size: resolveThemeVariableAsNumber(themeCssVariables.icon.size.md),
          stroke: resolveThemeVariableAsNumber(
            themeCssVariables.icon.stroke.sm,
          ),
        })
      ) : isDefined(firstSelectedOption?.Icon) ? (
        <firstSelectedOption.Icon
          color={resolveThemeVariable(
            isDisabled
              ? themeCssVariables.font.color.light
              : themeCssVariables.font.color.primary,
          )}
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
          stroke={resolveThemeVariableAsNumber(
            themeCssVariables.icon.stroke.sm,
          )}
        />
      ) : null}
      {isDefined(fixedText) ? (
        <OverflowingTextWithTooltip text={fixedText} />
      ) : (
        <OverflowingTextWithTooltip text={firstSelectedOption?.label ?? ''} />
      )}

      <StyledIconChevronDownWrapper disabled={isDisabled}>
        <IconChevronDown
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        />
      </StyledIconChevronDownWrapper>
    </StyledControlContainer>
  );
};
