import { SelectOption } from '@/ui/input/components/Select';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown } from 'twenty-ui';

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
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronDown = styled(IconChevronDown)<{
  disabled?: boolean;
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
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
      <StyledControlLabel>
        {!!selectedOption?.Icon && (
          <selectedOption.Icon
            color={
              isDisabled ? theme.font.color.light : theme.font.color.primary
            }
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        {selectedOption?.label}
      </StyledControlLabel>
      <StyledIconChevronDown disabled={isDisabled} size={theme.icon.size.md} />
    </StyledControlContainer>
  );
};
