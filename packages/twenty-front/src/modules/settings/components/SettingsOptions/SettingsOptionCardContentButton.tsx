import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/display';

type SettingsOptionCardContentButtonProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string | React.ReactNode;
  disabled?: boolean;
  Button?: React.ReactNode;
};

const StyledButtonContainer = styled.div`
  margin-left: auto;
`;

export const SettingsOptionCardContentButton = ({
  Icon,
  title,
  description,
  disabled = false,
  Button,
}: SettingsOptionCardContentButtonProps) => {
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
      {Button && <StyledButtonContainer>{Button}</StyledButtonContainer>}
    </StyledSettingsCardContent>
  );
};
