import { SelectOption } from '@/ui/input/components/Select';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown, isDefined } from 'twenty-ui';

const StyledControlContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.tertiary : theme.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  max-width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  flex-grow: 1;
  flex-shrink: 1;
`;

const StyledIconChevronDown = styled(IconChevronDown)<{
  disabled?: boolean;
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
  flex-shrink: 0;
`;

const StyledIconContainer = styled.span`
  display: flex;
  flex-shrink: 0;
`;

const StyledLabel = styled.span`
  flex-grow: 1;
  flex-shrink: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

type SelectControlProps = {
  selectedOption: SelectOption<string | number | null>;
  isDisabled?: boolean;
};

export const SelectControl = ({
  selectedOption,
  isDisabled,
}: SelectControlProps) => {
  const theme = useTheme();

  return (
    <StyledControlContainer disabled={isDisabled}>
      {isDefined(selectedOption.Icon) ? (
        <StyledIconContainer>
          <selectedOption.Icon
            color={
              isDisabled ? theme.font.color.light : theme.font.color.primary
            }
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconContainer>
      ) : null}
      <StyledLabel>{selectedOption.label}</StyledLabel>
      <StyledIconChevronDown disabled={isDisabled} size={theme.icon.size.md} />
    </StyledControlContainer>
  );
};
