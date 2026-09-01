import { isNonEmptyString } from '@sniptt/guards';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';

import { Separator } from 'src/front-components/components/Separator';
import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsCounter } from 'src/front-components/components/SettingsCounter';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';
import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';

type SettingsOptionCardContentCounterProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  inputId?: string;
  value: string;
  onChange: (value: string) => void;
  minValue?: number;
  maxValue?: number;
};

export const SettingsOptionCardContentCounter = ({
  Icon,
  title,
  description,
  divider,
  disabled = false,
  errorMessage,
  inputId,
  value,
  onChange,
  minValue,
  maxValue,
}: SettingsOptionCardContentCounterProps) => (
  <>
    <StyledSettingsCardContent>
      {Icon && (
        <StyledSettingsCardIcon>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </StyledSettingsCardIcon>
      )}
      <StyledSettingsCardTextContainer>
        <StyledSettingsCardTitle>
          <label htmlFor={inputId}>{title}</label>
        </StyledSettingsCardTitle>
        {description && (
          <StyledSettingsCardDescription>
            <OverflowingTextWithTooltip text={description} />
          </StyledSettingsCardDescription>
        )}
        {isNonEmptyString(errorMessage) && (
          <StyledSettingsError>{errorMessage}</StyledSettingsError>
        )}
      </StyledSettingsCardTextContainer>
      <SettingsCounter
        inputId={inputId}
        value={value}
        onChange={onChange}
        minValue={minValue}
        maxValue={maxValue}
        disabled={disabled}
      />
    </StyledSettingsCardContent>
    {divider && <Separator />}
  </>
);
