export const formatApiUrl = (url: URL) =>
  `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
