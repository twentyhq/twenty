// Don't use this hook directly! Prefer the high level hooks like:
// useRedirectToDefaultDomain and useRedirectToWorkspaceDomain

export const useRedirect = () => {
  const redirect = useDebouncedCallback((url: string) => {
    window.location.href = url;
  }, 100);

  return {
    redirect,
  };
};
