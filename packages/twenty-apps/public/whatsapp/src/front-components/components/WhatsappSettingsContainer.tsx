import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { t, useColorScheme } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import {
  THEME_DARK,
  THEME_LIGHT,
  ThemeProvider,
  themeCssVariables,
} from 'twenty-ui/theme';

import { WhatsappSettingsSkeleton } from 'src/front-components/components/WhatsappSettingsSkeleton';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { type WhatsappSettingsLoadState } from 'src/types/whatsapp-settings-load-state.type';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;

  button svg {
    pointer-events: none;
  }
`;

type WhatsappSettingsContainerProps = {
  state: WhatsappSettingsLoadState;
  onLoad: () => void;
  children: ReactNode;
};

export const WhatsappSettingsContainer = ({
  state,
  onLoad,
  children,
}: WhatsappSettingsContainerProps) => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      colorScheme={colorScheme}
      theme={colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT}
    >
      <StyledContainer>
        <OnMountEffect onMount={onLoad} />
        {state.step === 'loading' && <WhatsappSettingsSkeleton />}
        {state.step === 'unavailable' && (
          <InlineBanner
            layout="compact"
            status="error"
            action={
              <InlineBanner.Action onClick={onLoad}>
                {t('Retry')}
              </InlineBanner.Action>
            }
          >
            {t('Could not load WhatsApp settings.')}
          </InlineBanner>
        )}
        {state.step === 'ready' && !state.view.isConnected && (
          <Section.Root>
            <Section.Header
              title={t('Account')}
              description={t(
                'Connect your WhatsApp account to choose what gets synced.',
              )}
            />
          </Section.Root>
        )}
        {children}
      </StyledContainer>
    </ThemeProvider>
  );
};
