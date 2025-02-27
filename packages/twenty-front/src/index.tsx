import ReactDOM from 'react-dom/client';

import '@emotion/react';

import { App } from '@/app/components/App';
import 'react-loading-skeleton/dist/skeleton.css';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

root.render(<App />);

document.addEventListener('keydown', (event) => {
  console.log('event', event);
  const target = event.target as HTMLElement;
  const isTypeable = target.getAttribute('contenteditable') === 'true' || ['INPUT', 'TEXTAREA'].includes(target.tagName);
  if (event.ctrlKey && event.shiftKey && event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
    target.setAttribute('dir', 'rtl');
  } else if (event.ctrlKey && event.shiftKey && event.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
    target.setAttribute('dir', 'ltr');
  }
})