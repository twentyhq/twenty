import { Separator } from '@/settings/components/Separator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { styled } from '@linaria/react';
import { useId } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { Switch } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSwitch = styled(Switch)`
  &[data-centered] {
    align-self: center;
  }

  &[data-advanced-mode] {
    color: ${themeCssVariables.color.yellow};
  }
`;

const StyledSettingsCardToggleContent = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  position: relative;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledSettingsCardToggleButtonContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

const StyledSettingsCardToggleCover = styled.span`
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

type SettingsOptionCardContentToggleProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  advancedMode?: boolean;
  toggleCentered?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const SettingsOptionCardContentToggle = ({
  Icon,
  title,
  description,
  divider,
  disabled = false,
  advancedMode = false,
  toggleCentered = true,
  checked,
  onChange,
}: SettingsOptionCardContentToggleProps) => {
  const toggleId = useId();

  return (
    <>
      <StyledSettingsCardToggleContent disabled={disabled}>
        {Icon && (
          <StyledSettingsCardIcon>
            <SettingsOptionIconCustomizer Icon={Icon} />
          </StyledSettingsCardIcon>
        )}
        <StyledSettingsCardTextContainer>
          <StyledSettingsCardTitle>
            <label htmlFor={toggleId}>
              {title}
              <StyledSettingsCardToggleCover />
            </label>
          </StyledSettingsCardTitle>
          {description && (
            <StyledSettingsCardDescription>
              <OverflowingTextWithTooltip text={description} />
            </StyledSettingsCardDescription>
          )}
        </StyledSettingsCardTextContainer>
        <StyledSettingsCardToggleButtonContainer>
          <StyledSwitch
            id={toggleId}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            size="sm"
            data-advanced-mode={advancedMode || undefined}
            data-centered={toggleCentered || undefined}
          />
        </StyledSettingsCardToggleButtonContainer>
      </StyledSettingsCardToggleContent>
      {divider && <Separator />}
    </>
  );
};
