import { Separator } from '@/settings/components/Separator';
import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { styled } from '@linaria/react';
import { useId } from 'react';
import {
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import {
  themeCssVariables,
  resolveThemeVariable,
} from 'twenty-ui/theme-constants';

const StyledSettingsCardToggleContentWrapper = styled.div<{
  disabled?: boolean;
}>`
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  position: relative;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover > * {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledSettingsCardToggleButtonContainer = styled.div`
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
      <StyledSettingsCardToggleContentWrapper disabled={disabled}>
        <StyledSettingsCardContent>
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
            <Toggle
              id={toggleId}
              value={checked}
              onChange={onChange}
              disabled={disabled}
              toggleSize="small"
              color={
                advancedMode
                  ? resolveThemeVariable(themeCssVariables.color.yellow)
                  : resolveThemeVariable(themeCssVariables.color.blue)
              }
              centered={toggleCentered}
            />
          </StyledSettingsCardToggleButtonContainer>
        </StyledSettingsCardContent>
      </StyledSettingsCardToggleContentWrapper>
      {divider && <Separator />}
    </>
  );
};
