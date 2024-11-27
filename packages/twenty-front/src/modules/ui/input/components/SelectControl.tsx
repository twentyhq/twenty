import { SelectOption, SelectSizeVariant } from '@/ui/input/components/Select';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconChevronDown,
  isDefined,
  OverflowingTextWithTooltip,
} from 'twenty-ui';

const StyledControlContainer = styled.div<{
  disabled?: boolean;
  hasIcon: boolean;
  selectSizeVariant?: SelectSizeVariant;
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
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.tertiary : theme.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  text-align: left;
`;

const StyledIconChevronDown = styled(IconChevronDown)<{
  disabled?: boolean;
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
`;

type SelectControlProps = {
  selectedOption: SelectOption<string | number | boolean | null>;
  isDisabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
};

export const SelectControl = ({
  selectedOption,
  isDisabled,
  selectSizeVariant,
}: SelectControlProps) => {
  const theme = useTheme();

  return (
    <StyledControlContainer
      disabled={isDisabled}
      hasIcon={isDefined(selectedOption.Icon)}
      selectSizeVariant={selectSizeVariant}
    >
      {isDefined(selectedOption.Icon) ? (
        <selectedOption.Icon
          color={isDisabled ? theme.font.color.light : theme.font.color.primary}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      ) : null}
      <OverflowingTextWithTooltip text={selectedOption.label} />
      <StyledIconChevronDown disabled={isDisabled} size={theme.icon.size.md} />
    </StyledControlContainer>
  );
};
