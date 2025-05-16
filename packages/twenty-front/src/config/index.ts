declare global {
  interface Window {
    _env_?: Record<string, string>;
    __APOLLO_CLIENT__?: any;
  }
}

const getDefaultUrl = () => {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    // In development environment front and backend usually run on separate ports
    // we set the default value to localhost:3000.
    // In dev context, we use env vars to overwrite it
    return 'http://localhost:3000';
  } else {
    // Outside of localhost we assume that they run on the same port
    // because the backend will serve the frontend
    // In prod context, we use index.html + window var to ovewrite it
    return `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }`;
  }
};

export const REACT_APP_SERVER_BASE_URL =
  window._env_?.REACT_APP_SERVER_BASE_URL ||
  process.env.REACT_APP_SERVER_BASE_URL ||
  getDefaultUrl();

export const REACT_APP_CHATBOT_BASE_URL =
  window._env_?.REACT_APP_CHATBOT_BASE_URL ||
  process.env.REACT_APP_CHATBOT_BASE_URL;

export const REACT_APP_STRIPE_PUBLISHABLE_KEY =
  window._env_?.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

export const REACT_APP_FIREBASE_API_KEY =
  window._env_?.REACT_APP_FIREBASE_API_KEY ||
  process.env.REACT_APP_FIREBASE_API_KEY;

export const REACT_APP_FIREBASE_AUTH_DOMAIN =
  window._env_?.REACT_APP_FIREBASE_AUTH_DOMAIN ||
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;

export const REACT_APP_FIREBASE_PROJECT_ID =
  window._env_?.REACT_APP_FIREBASE_PROJECT_ID ||
  process.env.REACT_APP_FIREBASE_PROJECT_ID;

export const REACT_APP_FIREBASE_STORAGE_BUCKET =
  window._env_?.REACT_APP_FIREBASE_STORAGE_BUCKET ||
  process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;

export const REACT_APP_FIREBASE_MESSAGING_SENDER_ID =
  window._env_?.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;

export const REACT_APP_FIREBASE_APP_ID =
  window._env_?.REACT_APP_FIREBASE_APP_ID ||
  process.env.REACT_APP_FIREBASE_APP_ID;

export const REACT_APP_FOCUS_NFE_ENCRYPTION_KEY =
  process.env.REACT_APP_FOCUS_NFE_ENCRYPTION_KEY ||
  window._env_?.REACT_APP_FOCUS_NFE_ENCRYPTION_KEY;

// export const REACT_APP_FOCUS_NFE_ENCRYPTION_KEY = import.meta.env
//   .VITE_FOCUS_NFE_ENCRYPTION_KEY;
