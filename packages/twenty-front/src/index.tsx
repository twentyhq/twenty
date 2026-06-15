import ReactDOM from 'react-dom/client';

import { App } from '@/app/components/App';
import { migrateTokenPairCookieToLocalStorage } from '@/auth/utils/migrateTokenPairCookieToLocalStorage';
import { hydrateMetadataStore } from '@/metadata-store/states/metadataStoreState';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui-deprecated/style.css';
import 'twenty-ui-deprecated/theme-light.css';
import 'twenty-ui-deprecated/theme-dark.css';
// New twenty-ui ships its component styles (e.g. Toggle SCSS modules) in its own
// style.css; the --t-* theme tokens it relies on are already provided above.
import 'twenty-ui/style.css';
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

// Hydrate the IndexedDB-backed metadata cache into memory before mounting so the
// metadata atoms (getOnInit:true) read the persisted snapshot synchronously and
// keep the cache-first boot. Render anyway if hydration fails — the app then
// falls back to fetching metadata from the network.
hydrateMetadataStore().then(renderApp, renderApp);
