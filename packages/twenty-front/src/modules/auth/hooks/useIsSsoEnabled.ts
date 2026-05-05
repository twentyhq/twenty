export const useIsSsoEnabled = (): boolean => {
  return window._env_?.AUTH_TYPE === 'SSO';
};
