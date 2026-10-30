import ReactDOM from 'react-dom/client';

import { App } from '@/app/components/App';
import '@/app/utils/setupMonacoEnvironment';
import { hydrateMetadataStore } from '@/metadata-store/storage/metadataStoreStorage';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';
import './index.css';
// Salesfarce: remove with the theme
import { salesfarceLoadStyles } from '@/salesfarce/utils/salesfarceLoadStyles';

const renderApp = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') ?? document.body,
  );

  root.render(<App />);
};

// Salesfarce: on removal, restore hydrateMetadataStore().then(renderApp, renderApp)
void Promise.allSettled([hydrateMetadataStore(), salesfarceLoadStyles()]).then(
  renderApp,
);
