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
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { fromNavigator, fromStorage, fromUrl } from '@lingui/detect-locale';
import { APP_LOCALES, isDefined, isValidLocale } from 'twenty-shared';

export const App = () => {
  const urlLocale = fromUrl('lang');
  const storageLocale = fromStorage('lang');
  const navigatorLocale = fromNavigator();

  let locale: keyof typeof APP_LOCALES = APP_LOCALES.en;

  if (isDefined(urlLocale) && isValidLocale(urlLocale)) {
    locale = urlLocale;
    try {
      localStorage.setItem('lang', urlLocale);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
  } else if (isDefined(storageLocale) && isValidLocale(storageLocale)) {
    locale = storageLocale;
  } else if (isDefined(navigatorLocale) && isValidLocale(navigatorLocale)) {
    locale = navigatorLocale;
  }

  dynamicActivate(locale);

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
