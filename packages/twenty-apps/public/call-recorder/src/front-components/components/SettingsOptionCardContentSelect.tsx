import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Separator } from 'src/front-components/components/Separator';
import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

const StyledSelectContainer = styled.div`
  flex-shrink: 0;
  justify-content: flex-end;
  margin-left: auto;
  max-width: ${() => themeCssVariables.spacing[30]};
`;

type SettingsOptionCardContentSelectProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  isDimmed?: boolean;
  children?: React.ReactNode;
};

export const SettingsOptionCardContentSelect = ({
  Icon,
  title,
  description,
  divider,
  isDimmed = false,
  children,
}: SettingsOptionCardContentSelectProps) => (
  <>
    <StyledSettingsCardContent $isDimmed={isDimmed}>
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
    {divider && <Separator />}
  </>
);
