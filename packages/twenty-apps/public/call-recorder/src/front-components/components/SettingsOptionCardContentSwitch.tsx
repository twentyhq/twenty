import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { SettingsCardSeparator } from 'src/front-components/components/SettingsCardSeparator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardRow,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

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
  title: ReactNode;
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
        <StyledSettingsCardRow>
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
        </StyledSettingsCardRow>
      </Card.Content>
      {divider && <SettingsCardSeparator />}
    </>
  );
};
