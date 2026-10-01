import { DomainShell } from '@/app/components/DomainShell';
import { I18nActivationGate } from '@/app/components/I18nActivationGate';
import { LocaleDirectionProvider } from '@/app/components/LocaleDirectionProvider';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppRootErrorFallback } from '@/error-handler/components/AppRootErrorFallback';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Provider as JotaiProvider } from 'jotai';
import { ToastProvider } from 'twenty-ui/components';
import { IconsProvider } from 'twenty-ui/icon';
import { initialI18nActivate } from '~/utils/i18n/initialI18nActivate';

initialI18nActivate();

export const App = () => {
  return (
    <JotaiProvider store={jotaiStore}>
      <AppErrorBoundary
        resetOnLocationChange={false}
        FallbackComponent={AppRootErrorFallback}
      >
        <I18nActivationGate>
          <I18nProvider i18n={i18n}>
            <LocaleDirectionProvider>
              <ApolloDevLogEffect />
              <ToastProvider>
                <IconsProvider>
                  <ExceptionHandlerProvider>
                    <HelmetProvider>
                      <ClickOutsideListenerContext.Provider
                        value={{ excludedClickOutsideId: undefined }}
                      >
                        <DomainShell />
                      </ClickOutsideListenerContext.Provider>
                    </HelmetProvider>
                  </ExceptionHandlerProvider>
                </IconsProvider>
              </ToastProvider>
            </LocaleDirectionProvider>
          </I18nProvider>
        </I18nActivationGate>
      </AppErrorBoundary>
    </JotaiProvider>
  );
};
