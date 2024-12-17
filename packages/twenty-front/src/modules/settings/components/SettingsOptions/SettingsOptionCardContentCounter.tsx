import { SettingsCounter } from '@/settings/components/SettingsCounter';
import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { IconComponent } from 'twenty-ui';

type SettingsOptionCardContentCounterProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  disabled?: boolean;
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
};

export const SettingsOptionCardContentCounter = ({
  Icon,
  title,
  description,
  disabled = false,
  value,
  onChange,
  minValue,
  maxValue,
}: SettingsOptionCardContentCounterProps) => {
  return (
    <StyledSettingsOptionCardContent disabled={disabled}>
      {Icon && (
        <StyledSettingsOptionCardIcon>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </StyledSettingsOptionCardIcon>
      )}
      <div>
        <StyledSettingsOptionCardTitle>{title}</StyledSettingsOptionCardTitle>
        {description && (
          <StyledSettingsOptionCardDescription>
            {description}
          </StyledSettingsOptionCardDescription>
        )}
      </div>
      <SettingsCounter
        value={value}
        onChange={onChange}
        minValue={minValue}
        maxValue={maxValue}
        disabled={disabled}
      />
    </StyledSettingsOptionCardContent>
  );
};
