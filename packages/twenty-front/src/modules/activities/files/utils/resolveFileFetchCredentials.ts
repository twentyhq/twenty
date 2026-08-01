import { REACT_APP_SERVER_BASE_URL } from '~/config';

// Files are served by the Twenty server and need the session cookie, but these
// helpers also receive third-party URLs (a storage link on a record). A
// credentialed request to a bucket answering `Access-Control-Allow-Origin: *`
// is rejected by the browser, so credentials are scoped to our own origins.
export const resolveFileFetchCredentials = (
  url: string,
): RequestCredentials => {
  try {
    const { origin } = new URL(url, window.location.origin);

    return origin === window.location.origin ||
      origin === new URL(REACT_APP_SERVER_BASE_URL).origin
      ? 'include'
      : 'same-origin';
  } catch {
    return 'same-origin';
  }
};
