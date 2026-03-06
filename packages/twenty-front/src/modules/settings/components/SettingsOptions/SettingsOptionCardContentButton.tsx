import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { styled } from '@linaria/react';
import {
  type IconComponent,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { isDefined } from 'twenty-shared/utils';

type SettingsOptionCardContentButtonProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
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
        {description && (
          <StyledSettingsCardDescription>
            <OverflowingTextWithTooltip text={description} />
          </StyledSettingsCardDescription>
        )}
      </StyledSettingsCardTextContainer>
      {isDefined(Button) && <StyledButtonContainer>{Button}</StyledButtonContainer>}
    </StyledSettingsCardContent>
  );
};
