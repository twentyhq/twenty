import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import styled from '@emotion/styled';
import { useState } from 'react';
import { enqueueSnackbar, t, useColorScheme } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Loader } from 'twenty-ui/primitives/feedback';
import {
  THEME_DARK,
  THEME_LIGHT,
  ThemeProvider,
  themeCssVariables,
} from 'twenty-ui/theme';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LinkedinAccountSection } from 'src/front-components/components/LinkedinAccountSection';
import { LinkedinContactAutoCreationSection } from 'src/front-components/components/LinkedinContactAutoCreationSection';
import { LinkedinImportSection } from 'src/front-components/components/LinkedinImportSection';
import { LinkedinOptionsSection } from 'src/front-components/components/LinkedinOptionsSection';
import { LinkedinPersonReviewSection } from 'src/front-components/components/LinkedinPersonReviewSection';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { TimeoutEffect } from 'src/front-components/components/TimeoutEffect';
import { postLinkedinSettingsRouteOrThrow } from 'src/front-components/utils/post-linkedin-settings-route-or-throw.util';
import { type LinkedinSettings as LinkedinSettingsValues } from 'src/types/linkedin-settings.type';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

const HISTORY_IMPORT_POLL_MILLISECONDS = 5000;

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

type LinkedinSettingsState =
  | { step: 'loading' }
  | { step: 'unavailable' }
  | { step: 'ready'; view: LinkedinSettingsView };

export const LinkedinSettings = () => {
  const colorScheme = useColorScheme();
  const [state, setState] = useState<LinkedinSettingsState>({
    step: 'loading',
  });
  const [pollCount, setPollCount] = useState(0);
  const [resolvingHandle, setResolvingHandle] = useState<string | undefined>();

  const loadSettings = async () => {
    try {
      const view = await postLinkedinSettingsRouteOrThrow({
        routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.get,
      });

      setState({ step: 'ready', view });
    } catch {
      setState((current) =>
        current.step === 'ready' ? current : { step: 'unavailable' },
      );
    } finally {
      setPollCount((previousPollCount) => previousPollCount + 1);
    }
  };

  const handleSettingsChange = async (
    update: Partial<LinkedinSettingsValues>,
  ) => {
    setState((current) =>
      current.step === 'ready' && current.view.isConnected
        ? {
            step: 'ready',
            view: {
              ...current.view,
              settings: { ...current.view.settings, ...update },
            },
          }
        : current,
    );

    try {
      setState({
        step: 'ready',
        view: await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.update,
          body: update,
        }),
      });
    } catch {
      enqueueSnackbar({
        message: t('Could not save LinkedIn settings. Try again.'),
        variant: 'error',
      });
      await loadSettings();
    }
  };

  const handlePersonReviewResolve = async (body: {
    handle: string;
    personId?: string;
  }) => {
    setResolvingHandle(body.handle);

    try {
      setState({
        step: 'ready',
        view: await postLinkedinSettingsRouteOrThrow({
          routePath: LINKEDIN_SETTINGS_ROUTE_PATHS.resolvePersonReview,
          body,
        }),
      });
    } catch {
      enqueueSnackbar({
        message: t('Could not link this person. Try again.'),
        variant: 'error',
      });
      await loadSettings();
    } finally {
      setResolvingHandle(undefined);
    }
  };

  const view = state.step === 'ready' ? state.view : undefined;
  const isImportingHistory =
    view?.isConnected === true && view.historyImport?.status === 'IMPORTING';

  // Without an explicit theme, icon sizes resolve to var() strings SVG attributes cannot use.
  return (
    <ThemeProvider
      colorScheme={colorScheme}
      theme={colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT}
    >
      <StyledContainer>
        <OnMountEffect onMount={loadSettings} />
        {isImportingHistory && (
          <TimeoutEffect
            key={pollCount}
            delayMilliseconds={HISTORY_IMPORT_POLL_MILLISECONDS}
            onTimeout={loadSettings}
          />
        )}
        {state.step === 'loading' && <Loader />}
        {state.step === 'unavailable' && (
          <InlineBanner
            layout="compact"
            status="error"
            action={
              <InlineBanner.Action onClick={loadSettings}>
                {t('Retry')}
              </InlineBanner.Action>
            }
          >
            {t('Could not load LinkedIn settings.')}
          </InlineBanner>
        )}
        {view?.isConnected === false && (
          <Section.Root>
            <Section.Header
              title={t('Account')}
              description={t(
                'Connect your LinkedIn account to choose what gets synced.',
              )}
            />
          </Section.Root>
        )}
        {view?.isConnected === true && (
          <>
            <LinkedinAccountSection
              name={view.connection.name}
              handle={view.connection.handle}
              isAuthFailed={view.connection.isAuthFailed}
            />
            <LinkedinImportSection
              importRange={view.settings.importRange}
              historyImport={view.historyImport}
              onChange={(importRange) => handleSettingsChange({ importRange })}
            />
            {view.personReviews.length > 0 && (
              <LinkedinPersonReviewSection
                personReviews={view.personReviews}
                resolvingHandle={resolvingHandle}
                onResolve={handlePersonReviewResolve}
              />
            )}
            <LinkedinContactAutoCreationSection
              policy={view.settings.contactAutoCreationPolicy}
              onChange={(contactAutoCreationPolicy) =>
                handleSettingsChange({ contactAutoCreationPolicy })
              }
            />
            <LinkedinOptionsSection
              isNameMatchingEnabled={view.settings.isNameMatchingEnabled}
              areGroupConversationsExcluded={
                view.settings.areGroupConversationsExcluded
              }
              onNameMatchingChange={(isNameMatchingEnabled) =>
                handleSettingsChange({ isNameMatchingEnabled })
              }
              onGroupConversationsExclusionChange={(
                areGroupConversationsExcluded,
              ) => handleSettingsChange({ areGroupConversationsExcluded })}
            />
          </>
        )}
      </StyledContainer>
    </ThemeProvider>
  );
};
