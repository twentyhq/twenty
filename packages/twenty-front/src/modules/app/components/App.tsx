import { AppRouter } from '@/app/components/AppRouter';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppRootErrorFallback } from '@/error-handler/components/AppRootErrorFallback';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { IconsProvider } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { initialI18nActivate } from '~/utils/i18n/initialI18nActivate';

export const App = () => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    void initialI18nActivate().then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  if (!isI18nInitialized) {
    return <Loader />;
  }

  return (
    <RecoilRoot>
      <AppErrorBoundary
        resetOnLocationChange={false}
        FallbackComponent={AppRootErrorFallback}
      >
        <I18nProvider i18n={i18n}>
          <RecoilDebugObserverEffect />
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
                    <AppRouter />
                  </ClickOutsideListenerContext.Provider>
                </HelmetProvider>
              </ExceptionHandlerProvider>
            </IconsProvider>
          </SnackBarComponentInstanceContext.Provider>
        </I18nProvider>
      </AppErrorBoundary>
    </RecoilRoot>
  );
};
