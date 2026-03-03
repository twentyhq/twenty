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
import { useContext, useId } from 'react';
import {
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSettingsCardToggleContent = styled(StyledSettingsCardContent)`
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  position: relative;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledSettingsCardToggleButton = styled(Toggle)<{
  toggleCentered?: boolean;
}>`
  align-self: ${({ toggleCentered }) =>
    toggleCentered ? 'center' : 'flex-start'};
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
  const { theme } = useContext(ThemeContext);
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
        <StyledSettingsCardToggleButton
          id={toggleId}
          value={checked}
          onChange={onChange}
          disabled={disabled}
          toggleSize="small"
          color={advancedMode ? theme.color.yellow : theme.color.blue}
          toggleCentered={toggleCentered}
        />
      </StyledSettingsCardToggleContent>
      {divider && <Separator />}
    </>
  );
};
