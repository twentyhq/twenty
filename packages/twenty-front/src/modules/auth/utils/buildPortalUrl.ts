// Rewrite the current host's first label (`<prefix>-<app>`) to just
// `<prefix>`, then build a same-protocol root URL. Drives the SSO sign-out
// target in useAuth: `foss-twenty.local.moneta.dev` -> `foss.local.moneta.dev`.
// The regex requires a hyphen segment so non-`<prefix>-<app>` hosts
// (`localhost`, `foo.example.com`) no-op safely.
export const buildPortalUrl = (hostname: string, protocol: string) => {
  const portalHost = hostname.replace(/^([^-]+)-[^.]+\.(.+)/, '$1.$2');

  return `${protocol}//${portalHost}/`;
};
