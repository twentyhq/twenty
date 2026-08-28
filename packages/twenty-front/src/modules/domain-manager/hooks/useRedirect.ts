// Don't use this hook directly! Prefer the high level hooks like:
// useRedirectToDefaultDomain and useRedirectToWorkspaceDomain

import { useDebouncedCallback } from 'use-debounce';

export const useRedirect = () => {
  const redirect = useDebouncedCallback((url: string, target?: string) => {
    if (!target || target === '_self') {
      window.location.assign(url);
    } else {
      window.open(url, target);
    }
  }, 1);

  return {
    redirect,
  };
};
