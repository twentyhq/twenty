import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { IconsProvider } from 'twenty-ui';

import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import '@emotion/react';

import { App } from './App';

import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

root.render(
  <RecoilRoot>
    <AppErrorBoundary>
      <CaptchaProvider>
        <RecoilDebugObserverEffect />
        <ApolloDevLogEffect />
        <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
          <IconsProvider>
            <ExceptionHandlerProvider>
              <HelmetProvider>
                <App />
              </HelmetProvider>
            </ExceptionHandlerProvider>
          </IconsProvider>
        </SnackBarProviderScope>
      </CaptchaProvider>
    </AppErrorBoundary>
  </RecoilRoot>,
);
