import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPointFilled } from '@tabler/icons-react';

const StyledControlContainer = styled.div<{
  disabled?: boolean;
  selectedValue?: boolean;
}>`
  align-items: center;
  background-color: ${({ selectedValue }) => {
    switch (selectedValue) {
      case true:
        return '#ddfcd8';
      case false:
        return '#FED8D8';
      default:
        return '#d6d6d6';
    }
  }};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ selectedValue }) => {
    switch (selectedValue) {
      case true:
        return '#2A5822';
      case false:
        return '#712727';
      default:
        return '#000000';
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

interface SettingsIntegrationFocusNfeToggleStatusButtonProps {
  actualStatus: string;
  onClick?: (id: string) => void;
  disabled?: boolean;
}

export const SettingsIntegrationFocusNfeToggleStatusButton = ({
  actualStatus,
  onClick,
  disabled,
}: SettingsIntegrationFocusNfeToggleStatusButtonProps) => {
  const theme = useTheme();
  return (
    <StyledControlContainer
      selectedValue={actualStatus === 'active'}
      disabled={disabled}
      onClick={onClick ? () => onClick(actualStatus) : undefined}
    >
      <StyledControlLabel>
        <IconPointFilled
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
        {actualStatus}
      </StyledControlLabel>
    </StyledControlContainer>
  );
};
