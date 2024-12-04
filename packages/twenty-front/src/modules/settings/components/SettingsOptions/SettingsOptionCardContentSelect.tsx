import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { SelectValue } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

type SettingsOptionCardContentSelectProps<Value extends SelectValue> = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  selectClassName?: string;
  children?: React.ReactNode;
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
  children,
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
      <StyledSelectContainer>{children}</StyledSelectContainer>
    </StyledSettingsOptionCardContent>
  );
};
