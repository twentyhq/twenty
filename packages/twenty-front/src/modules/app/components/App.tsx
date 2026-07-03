import { DomainShell } from '@/app/components/DomainShell';
import { I18nActivationGate } from '@/app/components/I18nActivationGate';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppRootErrorFallback } from '@/error-handler/components/AppRootErrorFallback';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { Provider as JotaiProvider } from 'jotai';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
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
            <ApolloDevLogEffect />
            <SnackBarComponentInstanceContext.Provider
              value={{ instanceId: 'snack-bar-manager' }}
            >
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
            </SnackBarComponentInstanceContext.Provider>
          </I18nProvider>
        </I18nActivationGate>
      </AppErrorBoundary>
    </JotaiProvider>
  );
};
