export const isClientConfigAvailableFromWindow = (): boolean => {
  return Boolean(window._env_?.TWENTY_CLIENT_CONFIG);
};
