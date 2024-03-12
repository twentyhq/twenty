declare global {
  interface Window {
    __APOLLO_CLIENT__?: any;
    _env_?: Record<string, string>;
  }
}

const getDefaultUrl = () => {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    // In development environment front and backend usually run on seperate ports
    // we set the default value to localhost:3000, than can be overwritten by env vars
    return 'http://localhost:3000';
  } else {
    // Otherwise we assume that they run on the same port
    // Since it runs on the client's browser, we cannot overwrite it with env vars
    // Then we use env-config.js + window var to ovewrite it
    return `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }`;
  }
};

export const REACT_APP_SERVER_BASE_URL =
  window._env_?.REACT_APP_SERVER_BASE_URL ||
  process.env.REACT_APP_SERVER_BASE_URL ||
  getDefaultUrl();
