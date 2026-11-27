import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useId } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import {
  NumberStepper,
  type NumberStepperProps,
} from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsCardSeparator } from 'src/front-components/components/SettingsCardSeparator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardRow,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

const StyledCounterContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
  width: ${() => themeCssVariables.spacing[30]};
`;

type SettingsOptionCardContentCounterProps = {
  Icon?: IconComponent;
  title: ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  value: number | null;
  minValue?: number;
  maxValue?: number;
  onValueChange: NonNullable<NumberStepperProps['onValueChange']>;
  onBlur?: () => void;
};

export const SettingsOptionCardContentCounter = ({
  Icon,
  title,
  description,
  divider,
  disabled = false,
  value,
  minValue = 0,
  maxValue,
  onValueChange,
  onBlur,
}: SettingsOptionCardContentCounterProps) => {
  const { t } = useTranslate();
  const counterId = useId();
  const titleId = `${counterId}-title`;
  const descriptionId = `${counterId}-description`;
  const hasDescription = isNonEmptyString(description);

  return (
    <>
      <Card.Content>
        <StyledSettingsCardRow>
          {isDefined(Icon) && (
            <StyledSettingsCardIcon>
              <SettingsOptionIconCustomizer Icon={Icon} />
            </StyledSettingsCardIcon>
          )}
          <StyledSettingsCardTextContainer>
            <StyledSettingsCardTitle id={titleId}>
              {title}
            </StyledSettingsCardTitle>
            {hasDescription && (
              <StyledSettingsCardDescription id={descriptionId}>
                <OverflowingTextWithTooltip text={description} />
              </StyledSettingsCardDescription>
            )}
          </StyledSettingsCardTextContainer>
          <StyledCounterContainer>
            <NumberStepper
              aria-labelledby={titleId}
              aria-describedby={hasDescription ? descriptionId : undefined}
              value={value}
              min={minValue}
              max={maxValue}
              disabled={disabled}
              decrementLabel={t('Decrease value')}
              incrementLabel={t('Increase value')}
              onValueChange={onValueChange}
              onBlur={onBlur}
            />
          </StyledCounterContainer>
        </StyledSettingsCardRow>
      </Card.Content>
      {divider && <SettingsCardSeparator />}
    </>
  );
};
