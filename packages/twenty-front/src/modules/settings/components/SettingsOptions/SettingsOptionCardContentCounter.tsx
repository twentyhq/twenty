import { SettingsCounter } from '@/settings/components/SettingsCounter';
import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import {
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';

type SettingsOptionCardContentCounterProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  disabled?: boolean;
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  showButtons?: boolean;
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
  showButtons = true,
}: SettingsOptionCardContentCounterProps) => {
  return (
    <StyledSettingsCardContent disabled={disabled}>
      {Icon && (
        <StyledSettingsCardIcon>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </StyledSettingsCardIcon>
      )}
      <StyledSettingsCardTextContainer>
        <StyledSettingsCardTitle>{title}</StyledSettingsCardTitle>
        {description && (
          <StyledSettingsCardDescription>
            <OverflowingTextWithTooltip text={description} />
          </StyledSettingsCardDescription>
        )}
      </StyledSettingsCardTextContainer>
      <SettingsCounter
        value={value}
        onChange={onChange}
        minValue={minValue}
        maxValue={maxValue}
        disabled={disabled}
        showButtons={showButtons}
      />
    </StyledSettingsCardContent>
  );
};
