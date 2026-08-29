import { type Location } from 'react-router-dom';

// Routes matches against a Location, not a string, and the panel's path is
// stored as one.
export const toSidePanelLocation = (path: string): Location => {
  const [pathnameAndSearch, ...hashParts] = path.split('#');
  const [pathname, ...searchParts] = pathnameAndSearch.split('?');
  const search = searchParts.join('?');
  const hash = hashParts.join('#');

  return {
    pathname,
    search: search === '' ? '' : `?${search}`,
    hash: hash === '' ? '' : `#${hash}`,
    state: null,
    key: 'side-panel',
  };
};
