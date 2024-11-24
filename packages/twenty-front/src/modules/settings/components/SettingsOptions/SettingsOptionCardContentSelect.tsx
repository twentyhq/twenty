import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

const StyledSettingsOptionCardSelect = styled(Select)`
  margin-left: auto;
  width: 120px;
`;

type SelectValue = string | number | boolean | null;

type SettingsOptionCardContentSelectProps<Value extends SelectValue> = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  value: Value;
  onChange: (value: SelectValue) => void;
  options: {
    value: Value;
    label: string;
    Icon?: IconComponent;
  }[];
  selectClassName?: string;
  dropdownId: string;
  fullWidth?: boolean;
};

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
      <StyledSettingsOptionCardSelect
        className={selectClassName}
        dropdownWidth={fullWidth ? 'auto' : 120}
        disabled={disabled}
        dropdownId={dropdownId}
        value={value}
        onChange={onChange}
        options={options}
        selectSizeVariant="small"
      />
    </StyledSettingsOptionCardContent>
  );
};
