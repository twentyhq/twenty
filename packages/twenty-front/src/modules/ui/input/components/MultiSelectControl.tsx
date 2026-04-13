import {
  type SelectControlProps,
  StyledControlContainer,
} from '@/ui/input/components/SelectControl';
import { styled } from '@linaria/react';
import React, { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  type IconComponent,
  OverflowingTextWithTooltip,
  TintedIconTile,
} from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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
  iconThemeColor?: ThemeColor | null;
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
  const { theme } = useContext(ThemeContext);
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
          color: isDisabled ? theme.font.color.light : theme.font.color.primary,
          size: theme.icon.size.md,
          stroke: theme.icon.stroke.sm,
        })
      ) : isDefined(firstSelectedOption?.Icon) ? (
        isDefined(firstSelectedOption.iconThemeColor) ? (
          <TintedIconTile
            Icon={firstSelectedOption.Icon}
            color={firstSelectedOption.iconThemeColor}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        ) : (
          <firstSelectedOption.Icon
            color={
              isDisabled ? theme.font.color.light : theme.font.color.primary
            }
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )
      ) : null}
      {isDefined(fixedText) ? (
        <OverflowingTextWithTooltip text={fixedText} />
      ) : (
        <OverflowingTextWithTooltip text={firstSelectedOption?.label ?? ''} />
      )}

      <StyledIconChevronDownWrapper disabled={isDisabled}>
        <IconChevronDown size={theme.icon.size.md} />
      </StyledIconChevronDownWrapper>
    </StyledControlContainer>
  );
};
