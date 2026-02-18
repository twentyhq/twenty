import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
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
    <StyledSettingsCardContent disabled={disabled}>
      {Icon && (
        <StyledSettingsCardIcon>
          <SettingsOptionIconCustomizer Icon={Icon} />
        </StyledSettingsCardIcon>
      )}
      <div>
        <StyledSettingsCardTitle>{title}</StyledSettingsCardTitle>
        <StyledSettingsCardDescription>
          {description}
        </StyledSettingsCardDescription>
      </div>
      <StyledSelectContainer>{children}</StyledSelectContainer>
    </StyledSettingsCardContent>
  );
};
