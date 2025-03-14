import ReactDOM from 'react-dom/client';

import '@emotion/react';

import { App } from '@/app/components/App';
import 'react-loading-skeleton/dist/skeleton.css';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

// TRIGGER CI TO DROP
root.render(<App />);
