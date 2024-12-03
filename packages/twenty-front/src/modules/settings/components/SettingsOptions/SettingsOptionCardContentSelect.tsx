import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { Select, SelectValue } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

type SettingsOptionCardContentSelectProps<Value extends SelectValue> = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  value: Value;
  onChange: (value: Value) => void;
  options: {
    value: Value;
    label: string;
    Icon?: IconComponent;
  }[];
  selectClassName?: string;
  dropdownId: string;
  fullWidth?: boolean;
};

const StyledSelectContainer = styled.div`
  margin-left: auto;
`;

export const SettingsOptionCardContentSelect = <Value extends SelectValue>({
  Icon,
  title,
  description,
  divider,
  disabled = false,
  value,
  onChange,
  options,
  selectClassName,
  dropdownId,
  fullWidth,
}: SettingsOptionCardContentSelectProps<Value>) => {
  return (
    <StyledSettingsOptionCardContent divider={divider} disabled={disabled}>
      {Icon && (
        <StyledSettingsOptionCardIcon>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </StyledSettingsOptionCardIcon>
      )}
      <div>
        <StyledSettingsOptionCardTitle>{title}</StyledSettingsOptionCardTitle>
        <StyledSettingsOptionCardDescription>
          {description}
        </StyledSettingsOptionCardDescription>
      </div>
      <StyledSelectContainer>
        <Select<Value>
          className={selectClassName}
          dropdownWidth={fullWidth ? 'auto' : 120}
          disabled={disabled}
          dropdownId={dropdownId}
          value={value}
          onChange={onChange}
          options={options}
          selectSizeVariant="small"
        />
      </StyledSelectContainer>
    </StyledSettingsOptionCardContent>
  );
};
