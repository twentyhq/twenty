// Don't use this hook directly! Prefer the high level hooks like:
// useRedirectToDefaultDomain and useRedirectToWorkspaceDomain
import { sleep } from '~/utils/sleep';

export const useRedirect = () => {
  const redirect = (url: string) => {
    // This hacky workaround is necessary to ensure the tokens stored in the cookie are updated correctly.
    sleep(0).then(() => {
      window.location.href = url;
    });
  };

  return {
    redirect,
  };
};
