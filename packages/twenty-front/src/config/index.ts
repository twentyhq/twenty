import { getIsDevelopmentEnvironment } from '~/utils/getIsDevelopmentEnvironment';

const getDefaultUrl = () => {
  if (
    window.location.hostname.endsWith('localhost') ||
    window.location.hostname.endsWith('127.0.0.1')
  ) {
    // The vite dev server proxies the API route prefixes to the backend, so
    // the app calls its own origin and credentialed requests stay same-origin
    // on every host vite serves (workspace subdomains like apple.localhost
    // included).
    if (getIsDevelopmentEnvironment()) {
      return window.location.origin;
    }

    // Production builds browsed on localhost (e.g. a local docker image) keep
    // the historical split-port default.
    // In dev context, we use env vars to overwrite it
    return `http://${window.location.hostname}:3000`;
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
  window._env_?.REACT_APP_SERVER_BASE_URL || getDefaultUrl();
