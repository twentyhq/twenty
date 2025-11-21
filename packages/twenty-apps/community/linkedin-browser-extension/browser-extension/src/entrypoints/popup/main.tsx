import App from '@/entrypoints/popup/app';
import { ThemeContext } from '@/ui/theme/context/ThemeContext';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeContext>
      <App/>
    </ThemeContext>
  </React.StrictMode>
);
