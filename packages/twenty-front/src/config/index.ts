declare global {
  interface Window {
    _env_?: Record<string, string>;
    __APOLLO_CLIENT__?: any;
  }
}

export const REACT_APP_SERVER_BASE_URL =
  window._env_?.REACT_APP_SERVER_BASE_URL ||
  process.env.REACT_APP_SERVER_BASE_URL ||
  'http://localhost:3000';

export const REACT_APP_SERVER_AUTH_URL =
  window._env_?.REACT_APP_SERVER_AUTH_URL ||
  process.env.REACT_APP_SERVER_AUTH_URL ||
  REACT_APP_SERVER_BASE_URL + '/auth';

export const REACT_APP_SERVER_FILES_URL =
  window._env_?.REACT_APP_SERVER_FILES_URL ||
  process.env.REACT_APP_SERVER_FILES_URL ||
  REACT_APP_SERVER_BASE_URL + '/files';
