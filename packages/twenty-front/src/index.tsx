/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { App } from '@/app/components/App';
import '@emotion/react';
import ReactDOM from 'react-dom/client';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import './index.css';

declare global {
  interface Window {
    OneSignal: any;
  }
}

const loadOneSignalSDK = () => {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    script.onload = () => {
      resolve();
    };
    document.head.appendChild(script);
  });
};

loadOneSignalSDK().then(() => {
  console.log('✅ SDK carregado');
  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(function () {
    console.log('✅ Inicializando OneSignal...');
    window.OneSignal.init({
      appId: '6a60d376-b927-44ff-8f6f-a1696213ba9b',
      safari_web_id: 'web.onesignal.auto.201c9c11-2835-4563-82b9-55a6f9094e87',
      notifyButton: {
        enable: true,
      },
      allowLocalhostAsSecureOrigin: true,
    });
  });
});

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);
root.render(<App />);
