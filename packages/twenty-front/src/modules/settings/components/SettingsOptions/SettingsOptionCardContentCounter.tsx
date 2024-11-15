import { SettingsCounter } from '@/settings/components/SettingsCounter';
import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { useTheme } from '@emotion/react';
import { IconComponent } from 'twenty-ui';

type SettingsOptionCardContentCounterProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
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
  divider,
  disabled = false,
  value,
  onChange,
  minValue,
  maxValue,
}: SettingsOptionCardContentCounterProps) => {
  const theme = useTheme();

  return (
    <StyledSettingsOptionCardContent divider={divider} disabled={disabled}>
      {Icon && (
        <StyledSettingsOptionCardIcon>
          <Icon size={theme.icon.size.xl} stroke={theme.icon.stroke.lg} />
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
      />
    </StyledSettingsOptionCardContent>
  );
};
