import {
  StyledSettingsCardContent,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionCardDescription } from '@/settings/components/SettingsOptions/SettingsOptionCardDescription';
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
  flex-shrink: 0;
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
      <StyledSettingsCardTextContainer>
        <StyledSettingsCardTitle>{title}</StyledSettingsCardTitle>
        <SettingsOptionCardDescription description={description} />
      </StyledSettingsCardTextContainer>
      {Button && <StyledButtonContainer>{Button}</StyledButtonContainer>}
    </StyledSettingsCardContent>
  );
};
