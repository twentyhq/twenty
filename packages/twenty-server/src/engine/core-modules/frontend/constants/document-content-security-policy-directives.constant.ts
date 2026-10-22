// manifest-src keeps the credentialed manifest fetch (index.html) on our own origin, redirects included.
export const DOCUMENT_CONTENT_SECURITY_POLICY_DIRECTIVES =
  "object-src 'none'; base-uri 'self'; manifest-src 'self'";
