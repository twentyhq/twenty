import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type LinkedinAccountSectionProps = {
  name: string;
  handle: string;
  isAuthFailed: boolean;
};

export const LinkedinAccountSection = ({
  name,
  handle,
  isAuthFailed,
}: LinkedinAccountSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Account')}
      description={t('These settings apply to your LinkedIn connection.')}
    />
    <StyledStack>
      <StyledSettingsCard>
        <StyledSettingsCardContent>
          <Avatar name={name} colorSeed={handle} size="lg" shape="circle" />
          <StyledSettingsCardTextContainer>
            <StyledSettingsCardTitle>{name}</StyledSettingsCardTitle>
            <StyledSettingsCardDescription>
              {handle}
            </StyledSettingsCardDescription>
          </StyledSettingsCardTextContainer>
        </StyledSettingsCardContent>
      </StyledSettingsCard>
      {isAuthFailed && (
        <InlineBanner layout="compact" status="warning">
          {t(
            'LinkedIn signed you out. Reconnect your account to keep syncing.',
          )}
        </InlineBanner>
      )}
    </StyledStack>
  </Section.Root>
);
