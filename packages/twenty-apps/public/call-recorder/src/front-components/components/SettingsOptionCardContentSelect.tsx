import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsCardSeparator } from 'src/front-components/components/SettingsCardSeparator';
import {
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardRow,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';

const StyledSelectContainer = styled.div`
  flex-shrink: 0;
  margin-left: auto;
  max-width: ${() => themeCssVariables.spacing[30]};
`;

type SettingsOptionCardContentSelectProps = {
  Icon?: IconComponent;
  title: ReactNode;
  titleId?: string;
  description?: string;
  divider?: boolean;
  children?: ReactNode;
};

export const SettingsOptionCardContentSelect = ({
  Icon,
  title,
  titleId,
  description,
  divider,
  children,
}: SettingsOptionCardContentSelectProps) => (
  <>
    <Card.Content>
      <StyledSettingsCardRow>
        {isDefined(Icon) && (
          <StyledSettingsCardIcon>
            <SettingsOptionIconCustomizer Icon={Icon} />
          </StyledSettingsCardIcon>
        )}
        <StyledSettingsCardTextContainer>
          <StyledSettingsCardTitle id={titleId}>
            {title}
          </StyledSettingsCardTitle>
          {isNonEmptyString(description) && (
            <StyledSettingsCardDescription>
              <OverflowingTextWithTooltip text={description} />
            </StyledSettingsCardDescription>
          )}
        </StyledSettingsCardTextContainer>
        <StyledSelectContainer>{children}</StyledSelectContainer>
      </StyledSettingsCardRow>
    </Card.Content>
    {divider && <SettingsCardSeparator />}
  </>
);
