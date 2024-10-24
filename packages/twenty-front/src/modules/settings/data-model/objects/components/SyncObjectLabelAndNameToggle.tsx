import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconRefresh, MAIN_COLORS, Toggle } from 'twenty-ui';

const StyledToggleContainer = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledIconRefreshContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 3px;
  margin-right: ${({ theme }) => theme.spacing(3)};
  width: ${({ theme }) => theme.spacing(8)};
  height: ${({ theme }) => theme.spacing(8)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledDescription = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type SyncObjectLabelAndNameToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export const SyncObjectLabelAndNameToggle = ({
  value,
  onChange,
  disabled = false,
}: SyncObjectLabelAndNameToggleProps) => {
  const theme = useTheme();
  return (
    <StyledToggleContainer>
      <StyledTitleContainer>
        <StyledIconRefreshContainer>
          <IconRefresh size={22.5} color={theme.font.color.tertiary} />
        </StyledIconRefreshContainer>
        <div>
          <StyledTitle>Synchronize Objects Labels and API Names</StyledTitle>
          <StyledDescription>
            Should changing an object's label also change the API?
          </StyledDescription>
        </div>
      </StyledTitleContainer>
      <Toggle
        onChange={onChange}
        color={MAIN_COLORS.yellow}
        value={value}
        disabled={disabled}
      />
    </StyledToggleContainer>
  );
};
