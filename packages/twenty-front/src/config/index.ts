declare global {
  interface Window {
    __APOLLO_CLIENT__?: any;
  }
}

const getBaseUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  } else {
    return `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }`;
  }
};

export const REACT_APP_SERVER_BASE_URL =
  process.env.REACT_APP_SERVER_BASE_URL || getBaseUrl();
