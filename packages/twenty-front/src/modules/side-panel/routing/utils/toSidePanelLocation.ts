import { type Location, parsePath } from 'react-router-dom';

// Routes matches against a Location, not a string, and the panel's path is
// stored as one.
export const toSidePanelLocation = (path: string): Location => ({
  pathname: '',
  search: '',
  hash: '',
  ...parsePath(path),
  state: null,
  key: 'side-panel',
});
