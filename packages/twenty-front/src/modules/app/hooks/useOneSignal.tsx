/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useEffect } from 'react';

declare global {
  interface Window {
    OneSignalDeferred?: ((OneSignal: any) => void | Promise<void>)[];
  }
}

export const useOneSignal = () => {
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        if (document.getElementById('onesignal-script')) {
          return;
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal) => {
          console.log('[OneSignal] Inicializando...');

          await OneSignal.init({
            appId: 'd965d908-10f4-4b5b-ae65-a9608f09c42d',
            notifyButton: {
              enable: true,
            },
            allowLocalhostAsSecureOrigin: true,
          });

          const permission = await OneSignal.getNotificationPermission();
          console.log('[OneSignal] Permissão atual:', permission);

          if (permission !== 'granted') {
            await OneSignal.showSlidedownPrompt();
          }
        });

        const script = document.createElement('script');
        script.id = 'onesignal-script';
        script.src =
          'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        script.onload = () => console.info('[OneSignal] SDK carregado');
        script.onerror = () =>
          console.error('[OneSignal] Erro ao carregar SDK');
        document.body.appendChild(script);
      } catch (error) {
        console.error('[OneSignal] Erro no hook:', error);
      }
    };

    initOneSignal();
  }, []);
};
