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

import { LinkedinSettingsSkeleton } from 'src/front-components/components/LinkedinSettingsSkeleton';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { type LinkedinSettingsLoadState } from 'src/types/linkedin-settings-load-state.type';

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

type LinkedinSettingsContainerProps = {
  state: LinkedinSettingsLoadState;
  onLoad: () => void;
  children: ReactNode;
};

export const LinkedinSettingsContainer = ({
  state,
  onLoad,
  children,
}: LinkedinSettingsContainerProps) => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      colorScheme={colorScheme}
      theme={colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT}
    >
      <StyledContainer>
        <OnMountEffect onMount={onLoad} />
        {state.step === 'loading' && <LinkedinSettingsSkeleton />}
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
            {t('Could not load LinkedIn settings.')}
          </InlineBanner>
        )}
        {state.step === 'ready' && !state.view.isConnected && (
          <Section.Root>
            <Section.Header
              title={t('Account')}
              description={t(
                'Connect your LinkedIn account to choose what gets synced.',
              )}
            />
          </Section.Root>
        )}
        {children}
      </StyledContainer>
    </ThemeProvider>
  );
};
