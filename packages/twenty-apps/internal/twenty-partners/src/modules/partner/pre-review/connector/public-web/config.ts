export const PUBLIC_WEB_FETCH_TIMEOUT_MS = 12_000;

// Cloudflare, Zendesk and most marketing CDNs answer the default fetch UA with a
// challenge page; a browser-like UA gets the real HTML back.
export const PUBLIC_WEB_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export const PUBLIC_WEB_MAX_HTML_CHARS = 400_000;
export const PUBLIC_WEB_MAX_EXCERPT_CHARS = 4_000;
export const PUBLIC_WEB_MAX_CAPTION_CHARS = 6_000;
