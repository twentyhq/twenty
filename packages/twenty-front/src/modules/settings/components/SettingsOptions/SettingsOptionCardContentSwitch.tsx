import { SettingsCardSeparator } from '@/settings/components/SettingsCardSeparator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { styled } from '@linaria/react';
import { useId } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type IconComponent } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSettingsCardSwitchContent = styled.div<{ disabled?: boolean }>`
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

const StyledSettingsCardSwitchButtonContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

const StyledSettingsCardSwitchCover = styled.span`
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

type SettingsOptionCardContentSwitchProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const SettingsOptionCardContentSwitch = ({
  Icon,
  title,
  description,
  divider,
  disabled = false,
  checked,
  onChange,
}: SettingsOptionCardContentSwitchProps) => {
  const switchId = useId();

  return (
    <>
      <StyledSettingsCardSwitchContent disabled={disabled}>
        {Icon && (
          <StyledSettingsCardIcon>
            <SettingsOptionIconCustomizer Icon={Icon} />
          </StyledSettingsCardIcon>
        )}
        <StyledSettingsCardTextContainer>
          <StyledSettingsCardTitle>
            <label htmlFor={switchId}>
              {title}
              <StyledSettingsCardSwitchCover />
            </label>
          </StyledSettingsCardTitle>
          {description && (
            <StyledSettingsCardDescription>
              <OverflowingTextWithTooltip text={description} />
            </StyledSettingsCardDescription>
          )}
        </StyledSettingsCardTextContainer>
        <StyledSettingsCardSwitchButtonContainer>
          <Switch
            id={switchId}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            size="sm"
          />
        </StyledSettingsCardSwitchButtonContainer>
      </StyledSettingsCardSwitchContent>
      {divider && <SettingsCardSeparator />}
    </>
  );
};
