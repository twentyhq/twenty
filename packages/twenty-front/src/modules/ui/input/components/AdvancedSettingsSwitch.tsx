import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Switch } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.label<{ compact: boolean }>`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${({ compact }) =>
    compact ? themeCssVariables.spacing[8] : themeCssVariables.spacing[5]};
  justify-content: ${({ compact }) => (compact ? 'center' : 'space-between')};
  padding: ${({ compact }) => (compact ? '0' : themeCssVariables.spacing[1])};
  width: ${({ compact }) => (compact ? themeCssVariables.spacing[8] : '100%')};
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSwitch = styled(Switch)`
  ${StyledContainer} & {
    align-self: center;
    color: ${themeCssVariables.color.yellow};
  }
`;

type AdvancedSettingsSwitchProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
  label?: string;
  className?: string;
  compact?: boolean;
};

export const AdvancedSettingsSwitch = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  label,
  className,
  compact = false,
}: AdvancedSettingsSwitchProps) => {
  const { t } = useLingui();
  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const instanceId = useId();
  const switchLabel = label ?? t`Advanced`;

  return (
    <StyledContainer
      className={className}
      htmlFor={instanceId}
      compact={compact}
      title={compact ? switchLabel : undefined}
    >
      {!compact && <StyledText>{switchLabel}</StyledText>}
      <StyledSwitch
        id={instanceId}
        aria-label={switchLabel}
        onCheckedChange={onChange}
        checked={isAdvancedModeEnabled}
      />
    </StyledContainer>
  );
};
