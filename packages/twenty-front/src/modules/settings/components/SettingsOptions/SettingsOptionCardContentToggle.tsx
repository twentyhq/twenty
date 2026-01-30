import { Separator } from '@/settings/components/Separator';
import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useId } from 'react';
import { type IconComponent } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';

const StyledSettingsCardToggleContent = styled(StyledSettingsCardContent)`
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  position: relative;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledSettingsCardToggleButton = styled(Toggle)<{
  toggleCentered?: boolean;
}>`
  align-self: ${({ toggleCentered }) =>
    toggleCentered ? 'center' : 'flex-start'};
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
  description?: React.ReactNode;
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
      <StyledSettingsCardToggleContent disabled={disabled}>
        {Icon && (
          <StyledSettingsCardIcon>
            <SettingsOptionIconCustomizer Icon={Icon} />
          </StyledSettingsCardIcon>
        )}
        <div>
          <StyledSettingsCardTitle>
            <label htmlFor={toggleId}>
              {title}
              <StyledSettingsCardToggleCover />
            </label>
          </StyledSettingsCardTitle>
          <StyledSettingsCardDescription>
            {description}
          </StyledSettingsCardDescription>
        </div>
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
