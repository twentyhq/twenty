import { Toggle } from '@/ui/input/components/Toggle';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { IconTool, MAIN_COLORS } from 'twenty-ui';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconContainer = styled.div`
  border-right: 1px solid ${MAIN_COLORS.yellow};
  height: 16px;
  position: absolute;
  left: ${({ theme }) => theme.spacing(-5)};
`;

const StyledToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StyledIconTool = styled(IconTool)`
  margin-right: ${({ theme }) => theme.spacing(0.5)};
`;

export const AdvancedSettingsToggle = () => {
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useRecoilState(
    isAdvancedModeEnabledState,
  );

  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };

  return (
    <StyledContainer>
      <StyledIconContainer>
        <StyledIconTool size={12} color={MAIN_COLORS.yellow} />
      </StyledIconContainer>
      <StyledToggleContainer>
        <StyledText>Advanced:</StyledText>
        <Toggle
          onChange={onChange}
          color={MAIN_COLORS.yellow}
          value={isAdvancedModeEnabled}
        />
      </StyledToggleContainer>
    </StyledContainer>
  );
};
