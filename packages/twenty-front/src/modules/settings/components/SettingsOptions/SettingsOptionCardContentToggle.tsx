import { Separator } from '@/settings/components/Separator';
import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useId } from 'react';
import { IconComponent } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';

const StyledSettingsOptionCardToggleContent = styled(
  StyledSettingsOptionCardContent,
)`
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  position: relative;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledSettingsOptionCardToggleButton = styled(Toggle)<{
  toggleCentered?: boolean;
}>`
  align-self: ${({ toggleCentered }) =>
    toggleCentered ? 'center' : 'flex-start'};
  margin-left: auto;
`;

const StyledSettingsOptionCardToggleCover = styled.span`
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
  const theme = useTheme();
  const toggleId = useId();

  return (
    <>
      <StyledSettingsOptionCardToggleContent disabled={disabled}>
        {Icon && (
          <StyledSettingsOptionCardIcon>
            <SettingsOptionIconCustomizer Icon={Icon} />
          </StyledSettingsOptionCardIcon>
        )}
        <div>
          <StyledSettingsOptionCardTitle>
            <label htmlFor={toggleId}>
              {title}
              <StyledSettingsOptionCardToggleCover />
            </label>
          </StyledSettingsOptionCardTitle>
          <StyledSettingsOptionCardDescription>
            {description}
          </StyledSettingsOptionCardDescription>
        </div>
        <StyledSettingsOptionCardToggleButton
          id={toggleId}
          value={checked}
          onChange={onChange}
          disabled={disabled}
          toggleSize="small"
          color={advancedMode ? theme.color.yellow : theme.color.blue}
          toggleCentered={toggleCentered}
        />
      </StyledSettingsOptionCardToggleContent>
      {divider && <Separator />}
    </>
  );
};
