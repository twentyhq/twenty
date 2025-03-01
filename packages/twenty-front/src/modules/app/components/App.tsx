import { AppRouter } from '@/app/components/AppRouter';
import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { SafeRecoilURLSync } from '@/error-handler/components//SafeRecoilURLSync';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { IconsProvider } from 'twenty-ui';
import { initialI18nActivate } from '~/utils/i18n/initialI18nActivate';

initialI18nActivate();

export const App = () => {
  return (
    <RecoilRoot>
      <SafeRecoilURLSync>
        <AppErrorBoundary>
          <I18nProvider i18n={i18n}>
            <CaptchaProvider>
              <RecoilDebugObserverEffect />
              <ApolloDevLogEffect />
              <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
                <IconsProvider>
                  <ExceptionHandlerProvider>
                    <HelmetProvider>
                      <AppRouter />
                    </HelmetProvider>
                  </ExceptionHandlerProvider>
                </IconsProvider>
              </SnackBarProviderScope>
            </CaptchaProvider>
          </I18nProvider>
        </AppErrorBoundary>
      </SafeRecoilURLSync>
    </RecoilRoot>
  );
};
