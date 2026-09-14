import { i18n } from '@lingui/core';
import { messages } from './locales/en';
import { createRoot } from 'react-dom/client';
import { CompanionApp } from './CompanionApp';
import './style.css';

i18n.load('en', messages);
i18n.activate('en');

createRoot(document.getElementById('root')!).render(<CompanionApp />);
