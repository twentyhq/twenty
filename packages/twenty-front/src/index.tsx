import ReactDOM from 'react-dom/client';

import { App } from '@/app/components/App';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui-deprecated/style.css';
import 'twenty-ui-deprecated/theme-light.css';
import 'twenty-ui-deprecated/theme-dark.css';
// New twenty-ui ships its component styles (e.g. Toggle SCSS modules) in its own
// style.css; the --t-* theme tokens it relies on are already provided above.
import 'twenty-ui/style.css';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

root.render(<App />);
