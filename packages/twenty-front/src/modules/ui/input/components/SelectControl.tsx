import { type SelectSizeVariant } from '@/ui/input/components/Select';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

export type SelectControlTextAccent = 'default' | 'placeholder';

// TODO: factorize this with https://github.com/twentyhq/core-team-issues/issues/752
export const StyledControlContainer = styled.div<{
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

export const StyledSelectControlIconChevronDown = styled(IconChevronDown)<{
  disabled?: boolean;
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
`;

export type SelectControlProps = {
  selectedOption: SelectOption<string | number | boolean | null>;
  isDisabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  textAccent?: SelectControlTextAccent;
  hasRightElement?: boolean;
};

export const SelectControl = ({
  selectedOption,
  isDisabled,
  selectSizeVariant,
  textAccent = 'default',
  hasRightElement,
}: SelectControlProps) => {
  const theme = useTheme();

  return (
    <StyledControlContainer
      disabled={isDisabled}
      hasIcon={isDefined(selectedOption?.Icon)}
      selectSizeVariant={selectSizeVariant}
      textAccent={textAccent}
      hasRightElement={hasRightElement}
      title={selectedOption.fullLabel}
    >
      {isDefined(selectedOption?.Icon) ? (
        <selectedOption.Icon
          color={isDisabled ? theme.font.color.light : theme.font.color.primary}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      ) : null}
      <OverflowingTextWithTooltip text={selectedOption.label} />
      <StyledSelectControlIconChevronDown
        disabled={isDisabled}
        size={theme.icon.size.md}
      />
    </StyledControlContainer>
  );
};
