import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import {
  OverflowingTextWithTooltip,
  Text,
} from 'twenty-ui/primitives/typography';

import { SettingsCardSeparator } from 'src/front-components/components/SettingsCardSeparator';
import {
  StyledSettingsCardControlContainer,
  StyledSettingsCardIcon,
  StyledSettingsCardRow,
  StyledSettingsCardTextContainer,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

type SettingsOptionCardContentSwitchProps = {
  Icon?: IconComponent;
  title: string;
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
            <Text id={titleId} weight="medium" color="primary">
              {title}
            </Text>
            {hasDescription && (
              <Text id={descriptionId} size="sm" color="secondary">
                <Card.Control
                  render={
                    <label htmlFor={switchId} aria-labelledby={descriptionId} />
                  }
                >
                  <OverflowingTextWithTooltip text={description} />
                </Card.Control>
              </Text>
            )}
          </StyledSettingsCardTextContainer>
          <Card.Control render={<StyledSettingsCardControlContainer />}>
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
