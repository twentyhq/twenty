import { AppRouter } from '@/app/components/AppRouter';
import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { IconsProvider } from 'twenty-ui';

export const App = () => {
  return (
    <RecoilRoot>
      <AppErrorBoundary>
        <CaptchaProvider>
          <RecoilDebugObserverEffect />
          <ApolloDevLogEffect />
          <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
            <IconsProvider>
              <ExceptionHandlerProvider>
                <HelmetProvider>
                  <ContextStoreComponentInstanceContext.Provider
                    value={{
                      instanceId: 'global',
                    }}
                  >
                    <AppRouter />
                  </ContextStoreComponentInstanceContext.Provider>
                </HelmetProvider>
              </ExceptionHandlerProvider>
            </IconsProvider>
          </SnackBarProviderScope>
        </CaptchaProvider>
      </AppErrorBoundary>
    </RecoilRoot>
  );
};
