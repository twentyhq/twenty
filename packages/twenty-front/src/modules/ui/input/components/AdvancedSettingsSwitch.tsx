import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Switch } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.label<{ isCompact: boolean }>`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${({ isCompact }) =>
    isCompact
      ? `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`
      : themeCssVariables.spacing[5]};
  justify-content: ${({ isCompact }) =>
    isCompact ? 'center' : 'space-between'};
  padding: ${({ isCompact }) =>
    isCompact ? '0' : themeCssVariables.spacing[1]};
  width: ${({ isCompact }) =>
    isCompact ? `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px` : '100%'};
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
  isCompact?: boolean;
};

export const AdvancedSettingsSwitch = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  label,
  className,
  isCompact = false,
}: AdvancedSettingsSwitchProps) => {
  const { t } = useLingui();
  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const instanceId = useId();
  const labelId = `${instanceId}-text`;
  const switchLabel = label ?? t`Advanced`;

  return (
    <StyledContainer
      className={className}
      htmlFor={instanceId}
      isCompact={isCompact}
      title={isCompact ? switchLabel : undefined}
    >
      {!isCompact && <StyledText id={labelId}>{switchLabel}</StyledText>}
      <StyledSwitch
        id={instanceId}
        aria-label={isCompact ? switchLabel : undefined}
        aria-labelledby={isCompact ? undefined : labelId}
        onCheckedChange={onChange}
        checked={isAdvancedModeEnabled}
      />
    </StyledContainer>
  );
};
