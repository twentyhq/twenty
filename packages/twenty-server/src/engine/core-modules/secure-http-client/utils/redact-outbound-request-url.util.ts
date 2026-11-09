// Query strings, credentials and fragments can carry secrets; other protocols log as their scheme only
export const redactOutboundRequestUrl = (url: URL): string =>
  url.protocol === 'http:' || url.protocol === 'https:'
    ? `${url.origin}${url.pathname}`
    : url.protocol;
