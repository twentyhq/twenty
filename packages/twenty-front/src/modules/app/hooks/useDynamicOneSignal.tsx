/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useEffect } from 'react';

declare global {
  interface Window {
    OneSignalDeferred?: ((OneSignal: any) => void | Promise<void>)[];
  }
}

interface UseDynamicOneSignalProps {
  onesignalAppId?: string;
}

export const useDynamicOneSignal = ({
  onesignalAppId,
}: UseDynamicOneSignalProps) => {
  useEffect(() => {
    if (!onesignalAppId || typeof window === 'undefined') return;

    const initOneSignal = async () => {
      if (document.getElementById('onesignal-script')) return;

      window.OneSignalDeferred = window.OneSignalDeferred || [];

      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: onesignalAppId,
            notifyButton: {
              enable: true,
            },
            serviceWorker: {
              path: '/OneSignalSDKWorker.js',
              scope: '/',
              useWorker: true,
            },
            persistNotification: true,
          });

          const permission = await OneSignal.Notifications.permission;
          if (permission !== 'granted') {
            await OneSignal.Notifications.requestPermission();
          }
        } catch (error) {
          console.error('[OneSignal] erro na inicialização dinâmica', error);
        }
      });

      const script = document.createElement('script');
      script.id = 'onesignal-script';
      script.src =
        'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.body.appendChild(script);
    };

    initOneSignal();
  }, [onesignalAppId]);
};
