declare global {
  interface Window {
    _env_: any;
  }
}

export const REACT_APP_SERVER_BASE_URL =
  window._env_.REACT_APP_SERVER_BASE_URL ||
  process.env.REACT_APP_SERVER_BASE_URL ||
  'http://localhost:3000';
