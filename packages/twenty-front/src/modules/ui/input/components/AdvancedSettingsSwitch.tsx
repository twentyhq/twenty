import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Switch } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.label`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${themeCssVariables.spacing[5]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSwitch = styled(Switch)`
  ${StyledContainer} & {
    color: ${themeCssVariables.color.yellow};
  }
`;

type AdvancedSettingsSwitchProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
  label?: string;
  className?: string;
};

export const AdvancedSettingsSwitch = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  label,
  className,
}: AdvancedSettingsSwitchProps) => {
  const { t } = useLingui();
  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const instanceId = useId();

  return (
    <StyledContainer className={className} htmlFor={instanceId}>
      <StyledText>{label ?? t`Advanced`}</StyledText>
      <StyledSwitch
        id={instanceId}
        onCheckedChange={onChange}
        checked={isAdvancedModeEnabled}
      />
    </StyledContainer>
  );
};
