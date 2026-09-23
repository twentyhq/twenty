# Frontend HTML and workspace embedding

Production documents are served by `FrontendModule`. React still renders in the
browser; this is HTML template delivery, not server-side React rendering. The
template is read once from `dist/front/index.html`. Each document gets the public
`ClientConfigService` response and the framing policy for the requested workspace.
JavaScript, CSS, fonts and images can continue to be served from S3/CDN.
Existing local static files take precedence over the SPA fallback. The fallback
requires an explicit `Accept: text/html` and, when supplied, a document, iframe or
frame `Sec-Fetch-Dest`. API paths and file extensions other than `/index.html`
never fall back to the SPA. Use `Accept: text/html` in document smoke checks.

## Startup configuration

The server inserts escaped JSON in `script#twenty-client-config` before the
application starts. The client consumes it on initialization, removing the
`/client-config` round trip from the production startup dependency chain. Explicit
configuration refreshes still use `/client-config`.

Keep the endpoint during the compatibility period: Vite, older frontends, static
deployments, and already-open tabs still depend on it. Do not announce removal
until those supported modes have a replacement and observed fallback traffic has
been accounted for. Removing the startup request does not guarantee a faster
first paint: measure HTML TTFB and app-ready timing together, since configuration
and workspace lookup now precede the HTML response.

Only the existing public client configuration is embedded, never tokens or user
data. JSON escapes HTML delimiters and Unicode line separators. Baked-in API
origins are cleared in memory, allowing the existing same-origin API selection.
The server no longer rewrites files at startup, so read-only frontend directories
work.

## Workspace policy

Settings → Security → Iframe embedding accepts at most 20 exact HTTPS origins.
Updates require the existing workspace Security permission. Paths, wildcard hosts,
credentials and non-HTTPS schemes are rejected. A trailing slash/default port is
normalized; duplicate origins are removed. Removing every entry restores the
default prohibition on external framing.

The response uses `Content-Security-Policy: frame-ancestors 'self' ...`.
`X-Frame-Options: SAMEORIGIN` is kept only for the default policy; it is omitted
when external origins are explicitly allowed. Other CSP directives remain in
place. The policy is resolved from the request hostname, not `Origin`, `Referer`,
query parameters or client-provided workspace identifiers. HTML policy lookup
reads the workspace directly. GraphQL uses the existing workspace cache, which is
invalidated on updates. Isolated public application domains never receive the CRM
shell. A failed workspace lookup returns 503 with the restrictive policy.

HTML carries `Cache-Control`, `CDN-Cache-Control` and
`Cloudflare-CDN-Cache-Control: no-store`. Never cache workspace documents, including
deep links, at a shared proxy. Policy changes apply to subsequent navigations;
they cannot evict documents already loaded in an iframe. Alternate static HTML
paths are served with `frame-ancestors 'none'` and cannot bypass the dynamic policy.

## Deployment modes

| Mode | HTML | Assets | Initial configuration |
| --- | --- | --- | --- |
| Standard Docker / Compose / self-hosted Helm | Nest, bundled `dist/front/index.html` | Nest static files | Embedded JSON |
| All-in-one development image | Nest, bundled frontend | Nest static files | Embedded JSON |
| Cloud | Nest, exact HTML from frontend artifact | Existing S3/CDN | Embedded JSON |
| Local `yarn start` | Vite | Vite/HMR | Compatibility `/client-config` |
| Separate static frontend | Existing static host | Static host | Compatibility `/client-config` |

The existing Docker build targets already copy the frontend into `dist/front`;
no new environment variables, writable volume, or entrypoint is needed. Server-only
builds without `index.html` continue to run APIs without a frontend handler. To
exercise production delivery locally, build server and frontend first, copy the
frontend build into `packages/twenty-server/dist/front`, then start the compiled
server. The normal watch command clears `dist`, so it should continue using Vite.

Separate static deployments continue to load, but the workspace setting cannot
control headers on HTML that bypasses Nest. To enable the setting, send documents
to Nest and place the matching build's HTML in `dist/front/index.html`. Keep
immutable assets on the static host. Vite is a development mode, not an embedding
policy enforcement layer.

## Reverse proxy requirements

1. Apply the generated instance upgrade before deploying the new application.
   Existing workspaces default to an empty allowed-origin list. The generated
   command includes a down migration; a normal application rollback can leave the
   additive column in place.
2. Publish assets before exposing their matching HTML. Retain old hashed assets
   through rolling deploys and rollback. Do not independently rebuild the HTML.
3. Route documents (`/`, `/index.html`, and SPA deep links) to Nest with the
   original Host and path. Keep API and asset routes more specific than the HTML
   fallback. Configure `TRUST_PROXY` for the actual proxy topology and preserve
   the original HTTPS scheme. Never accept arbitrary forwarded hosts as tenant
   selectors.
4. Stop proxies/CDNs from setting, appending or deleting CSP and X-Frame-Options
   on backend HTML. Multiple CSP headers intersect; appending an allowlist cannot
   relax an existing `frame-ancestors 'self'`. Keep unrelated security headers.
5. Explicitly bypass document caching and remove SPA-to-S3 rewrites. Purge old
   cached documents at cutover. A response-header transform is not a cache bypass.
6. Verify final public responses on both workspace subdomains and custom domains:
   embedded JSON; no HTML cache hits; one authoritative CSP; allowed iframe loads;
   denied iframe blocks; removal blocks after reload; another workspace retains
   its own policy; APIs and missing assets still return API/404 responses.

For rolling deployments, keep API contracts compatible with both frontend
versions. Introduce API additions before releasing frontend code that requires
them; old and new pods can receive successive requests from the same browser.
For the initial cloud cutover, the ingress must switch only after all compatible
backend replicas are ready. Self-hosted multi-replica upgrades need the same
coordination or a maintenance window for this first schema-consuming frontend.

## Authentication in frames

This setting grants framing permission, not authentication or data access. Existing
workspace roles, sessions, cookie attributes and CORS rules still apply. Prefer a
same-site custom domain when embedding an authenticated workspace (for example,
`crm.example.com` inside `portal.example.com`). Sign in at top level when the
identity provider disallows framed login. Cross-site embedding remains subject to
the browser's third-party storage policy and may not support persistent sign-in.
Do not broaden cookies or CORS as a side effect of adding an embedding origin.

An iframe attribute, CORS header or browser-side script cannot override the
document's framing policy. All ancestor origins must be allowed in nested frames.
