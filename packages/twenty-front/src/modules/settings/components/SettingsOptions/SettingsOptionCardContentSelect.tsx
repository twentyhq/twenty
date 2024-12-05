import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

type SettingsOptionCardContentSelectProps = {
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

export const SettingsOptionCardContentSelect = ({
  Icon,
  title,
  description,
  divider,
  disabled = false,
  children,
}: SettingsOptionCardContentSelectProps) => {
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
