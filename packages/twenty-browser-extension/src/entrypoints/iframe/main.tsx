import Sidebar from '@/entrypoints/iframe/sidebar';
import { ThemeContext } from '@/ui/theme/context/ThemeContext.tsx';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeContext>
      <Sidebar></Sidebar>
    </ThemeContext>
  </React.StrictMode>,
);
