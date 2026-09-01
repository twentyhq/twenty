import styled from '@emotion/styled';
import { useId } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { Toggle } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Separator } from 'src/front-components/components/Separator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

const StyledSettingsCardToggleContent = styled.div<{ $disabled?: boolean }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  display: flex;
  gap: ${() => themeCssVariables.spacing[3]};
  padding: ${() => themeCssVariables.spacing[4]};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  position: relative;

  &:hover {
    background: ${() => themeCssVariables.background.transparent.lighter};
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
  toggleCentered = true,
  checked,
  onChange,
}: SettingsOptionCardContentToggleProps) => {
  const toggleId = useId();

  return (
    <>
      <StyledSettingsCardToggleContent $disabled={disabled}>
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
            color={themeCssVariables.color.blue}
            centered={toggleCentered}
          />
        </StyledSettingsCardToggleButtonContainer>
      </StyledSettingsCardToggleContent>
      {divider && <Separator />}
    </>
  );
};
