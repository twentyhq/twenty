import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import styled from '@emotion/styled';
import {
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';

type SettingsOptionCardContentSelectProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

const StyledSelectContainer = styled.div`
  flex-shrink: 0;
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
      <StyledSettingsCardTextContainer>
        <StyledSettingsCardTitle>{title}</StyledSettingsCardTitle>
        {description && (
          <StyledSettingsCardDescription>
            <OverflowingTextWithTooltip text={description} />
          </StyledSettingsCardDescription>
        )}
      </StyledSettingsCardTextContainer>
      <StyledSelectContainer>{children}</StyledSelectContainer>
    </StyledSettingsCardContent>
  );
};
