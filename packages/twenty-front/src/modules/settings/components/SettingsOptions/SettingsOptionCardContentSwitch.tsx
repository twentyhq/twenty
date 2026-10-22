import { SettingsCardSeparator } from '@/settings/components/SettingsCardSeparator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { useId } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type IconComponent } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSettingsCardSwitchContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledSettingsCardDescriptionText = styled.span`
  display: block;
`;

const StyledSettingsCardSwitchButtonContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
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
  const titleId = `${switchId}-title`;
  const descriptionId = `${switchId}-description`;
  const hasDescription = isNonEmptyString(description);

  return (
    <>
      <Card.Content>
        <Card.Action
          disabled={disabled}
          render={<label htmlFor={switchId} aria-labelledby={titleId} />}
        />
        <StyledSettingsCardSwitchContent>
          {isDefined(Icon) && (
            <StyledSettingsCardIcon>
              <SettingsOptionIconCustomizer Icon={Icon} />
            </StyledSettingsCardIcon>
          )}
          <StyledSettingsCardTextContainer>
            <StyledSettingsCardTitle id={titleId}>
              <label htmlFor={switchId}>{title}</label>
            </StyledSettingsCardTitle>
            {hasDescription && (
              <StyledSettingsCardDescription id={descriptionId}>
                <Card.Control
                  render={
                    <label htmlFor={switchId} aria-labelledby={descriptionId} />
                  }
                >
                  <OverflowingTextWithTooltip
                    text={description}
                    render={<StyledSettingsCardDescriptionText />}
                  />
                </Card.Control>
              </StyledSettingsCardDescription>
            )}
          </StyledSettingsCardTextContainer>
          <Card.Control render={<StyledSettingsCardSwitchButtonContainer />}>
            <Switch
              id={switchId}
              aria-labelledby={titleId}
              aria-describedby={hasDescription ? descriptionId : undefined}
              checked={checked}
              onCheckedChange={onChange}
              disabled={disabled}
              size="sm"
            />
          </Card.Control>
        </StyledSettingsCardSwitchContent>
      </Card.Content>
      {divider && <SettingsCardSeparator />}
    </>
  );
};
