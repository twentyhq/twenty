// Must be the very first import — activates i18n before any module
// can call i18n._() at module scope (e.g. Zod schemas in PasswordReset)
import '~/utils/i18n/initialI18nActivate';

import { disableFragmentWarnings } from '@apollo/client';
disableFragmentWarnings();

import ReactDOM from 'react-dom/client';

import '@emotion/react';

import { App } from '@/app/components/App';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

root.render(<App />);
