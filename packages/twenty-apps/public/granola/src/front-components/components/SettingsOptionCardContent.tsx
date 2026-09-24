import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

const StyledTrailingContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${() => themeCssVariables.spacing[2]};
  margin-left: auto;
`;

type SettingsOptionCardContentProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
};

export const SettingsOptionCardContent = ({
  Icon,
  title,
  description,
  children,
}: SettingsOptionCardContentProps) => (
  <StyledSettingsCardContent>
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
    <StyledTrailingContainer>{children}</StyledTrailingContainer>
  </StyledSettingsCardContent>
);
