import { type SelectSizeVariant } from '@/ui/input/components/Select';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import pluralize from 'pluralize';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { type MultiSelectOption } from 'twenty-ui/input';

export type SelectControlTextAccent = 'default' | 'placeholder';

const StyledControlContainer = styled.div<{
  disabled?: boolean;
  hasIcon: boolean;
  selectSizeVariant?: SelectSizeVariant;
  textAccent: SelectControlTextAccent;
  hasRightElement?: boolean;
}>`
  display: grid;
  grid-template-columns: ${({ hasIcon }) =>
    hasIcon ? 'auto 1fr auto' : '1fr auto'};
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  height: ${({ selectSizeVariant, theme }) =>
    selectSizeVariant === 'small' ? theme.spacing(6) : theme.spacing(8)};
  max-width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};

  ${({ hasRightElement, theme }) =>
    !hasRightElement
      ? css`
          border-right: auto;
          border-bottom-right-radius: ${theme.border.radius.sm};
          border-top-right-radius: ${theme.border.radius.sm};
        `
      : css`
          border-right: none;
          border-bottom-right-radius: none;
          border-top-right-radius: none;
        `}

  color: ${({ disabled, theme, textAccent }) =>
    disabled
      ? theme.font.color.tertiary
      : textAccent === 'default'
        ? theme.font.color.primary
        : theme.font.color.tertiary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  text-align: left;
`;

const StyledIconChevronDown = styled(IconChevronDown)<{
  disabled?: boolean;
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
`;

type MultiSelectControlProps<T> = {
  fixedIcon?: IconComponent;
  fixedText?: string;
  selectedOptions: MultiSelectOption<T>[];
  isDisabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  textAccent?: SelectControlTextAccent;
  hasRightElement?: boolean;
};

export const MultiSelectControl = <T,>({
  fixedIcon,
  fixedText,
  selectedOptions,
  isDisabled,
  selectSizeVariant,
  textAccent = 'default',
  hasRightElement,
}: MultiSelectControlProps<T>) => {
  const theme = useTheme();

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

      <StyledIconChevronDown disabled={isDisabled} size={theme.icon.size.md} />
    </StyledControlContainer>
  );
};
