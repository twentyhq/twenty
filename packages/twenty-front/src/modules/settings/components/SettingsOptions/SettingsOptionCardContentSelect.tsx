import {
  StyledSettingsOptionCardContent,
  StyledSettingsOptionCardDescription,
  StyledSettingsOptionCardIcon,
  StyledSettingsOptionCardTitle,
} from '@/settings/components/SettingsOptions/SettingsOptionCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/display';

type SettingsOptionCardContentSelectProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string | React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
};

const StyledSelectContainer = styled.div`
  justify-content: flex-end;
  margin-left: auto;
  max-width: 120px;
`;

export const SettingsOptionCardContentSelect = ({
  Icon,
  title,
  description,
  disabled = false,
  children,
}: SettingsOptionCardContentSelectProps) => {
  return (
    <StyledSettingsOptionCardContent disabled={disabled}>
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
