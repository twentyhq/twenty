import { AppRouter } from '@/app/components/AppRouter';
import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { RecoilURLSyncJSON } from 'recoil-sync';
import { IconsProvider } from 'twenty-ui';
import { messages as enMessages } from '../../../locales/generated/en';

i18n.load({
  en: enMessages,
});
i18n.activate('en');

export const App = () => {
  return (
    <RecoilRoot>
      <RecoilURLSyncJSON location={{ part: 'queryParams' }}>
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
      </RecoilURLSyncJSON>
    </RecoilRoot>
  );
};
