// Strip the first subdomain so we land on the portal (outside ForwardAuth)
// instead of Twenty's own root, which would silently re-auth. Drives the SSO
// sign-out target in useAuth.
//
// Works for the 4-label `<app>.<prefix>.<domain>` deployment shape used in
// sandbox + prod (`twenty.foss.arbisoft.com` -> `foss.arbisoft.com`).
//
// The lookahead requires at least 2 trailing labels with dots, so single-
// label hosts (`localhost`) and 2-label hosts (`foo.example.com`) no-op
// safely instead of stripping into nothing.
export const buildPortalUrl = (host: string, protocol: string) => {
  const portalHost = host.replace(/^[^.]+\.(?=[^.]*\.[^.]*\.)/, '');

  return `${protocol}//${portalHost}/`;
};
