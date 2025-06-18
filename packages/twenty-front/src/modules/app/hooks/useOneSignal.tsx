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
          console.log(
            '[OneSignal] Script já carregado. Ignorando nova inicialização.',
          );
          return;
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];

        window.OneSignalDeferred.push(async (OneSignal) => {
          console.log('[OneSignal] Inicializando SDK...');

          if (!OneSignal || !OneSignal.init) {
            console.error('[OneSignal] Objeto OneSignal inválido:', OneSignal);
            return;
          }

          try {
            await OneSignal.init({
              appId: 'd965d908-10f4-4b5b-ae65-a9608f09c42d', //TODO Remove this test key after testing is complete
              notifyButton: {
                enable: true,
              },
              allowLocalhostAsSecureOrigin: true,
              serviceWorker: {
                path: '/OneSignalSDKWorker.js',
                scope: '/',
              },
            });

            console.log('[OneSignal] SDK inicializado com sucesso.');

            if (!OneSignal.Notifications) {
              console.error('[OneSignal] Módulo Notifications não encontrado.');
              return;
            }

            const permission = await OneSignal.Notifications.permission;
            console.log('[OneSignal] Permissão atual:', permission);

            if (permission !== 'granted') {
              console.log('[OneSignal] Solicitando permissão...');
              const newPermission =
                await OneSignal.Notifications.requestPermission();
              console.log('[OneSignal] Nova permissão:', newPermission);
            }
          } catch (error) {
            console.error('[OneSignal] Erro na inicialização:', error);
          }
        });

        const script = document.createElement('script');
        script.id = 'onesignal-script';
        script.src =
          'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        script.onload = () =>
          console.info('[OneSignal] SDK carregado com sucesso.');
        script.onerror = (err) => {
          console.error('[OneSignal] Falha ao carregar SDK:', err);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('[OneSignal] Erro no hook:', error);
      }
    };

    initOneSignal();
  }, []);
};
