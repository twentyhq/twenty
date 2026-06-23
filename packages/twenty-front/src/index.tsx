import ReactDOM from 'react-dom/client';

import { App } from '@/app/components/App';
import { migrateTokenPairCookieToLocalStorage } from '@/auth/utils/migrateTokenPairCookieToLocalStorage';
import { hydrateMetadataStore } from '@/metadata-store/storage/metadataStoreStorage';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';
import './index.css';

// TODO: REMOVE this after 2026-12-12 — temporary migration of tokenPair from the
// legacy cookie to localStorage (legacy cookie has a 180-day expiry).
migrateTokenPairCookieToLocalStorage();

const renderApp = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') ?? document.body,
  );

  root.render(<App />);
};

hydrateMetadataStore().then(renderApp, renderApp);
