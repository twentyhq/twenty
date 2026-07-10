# Functions base URL: problem and proposal

Design note for PR #22825. Context for aligning on how the callable functions URL should work across cloud, self-hosted, and local dev.

## What we are facing

#22583 injects `TWENTY_FUNCTIONS_URL` into the logic function env so app code can call its own HTTP routes (webhook registration, self-invoking functions). The value came from `WorkspaceDomainsService.buildPublicFunctionBaseUrl`, which returns `undefined` when `PUBLIC_DOMAIN_URL` is unset.

`PUBLIC_DOMAIN_URL` is only set on Twenty cloud. So on every self-hosted instance and in local dev, the env var was an empty string. A function that calls its own routes works on cloud and silently breaks everywhere else.

The front already had the answer: `getFunctionsBaseUrl` falls back to `{serverBaseUrl}/s` when there is no public domain. So Settings displayed a working URL while the injected env var was empty. Front and server disagreed about what "the functions URL" is.

## Why "just set PUBLIC_DOMAIN_URL locally" does not work

`PUBLIC_DOMAIN_URL` is not a URL setting. It asserts that an isolated, cookieless public domain exists, with the infrastructure behind it. Setting it without that infrastructure fails three ways:

1. **The URLs 404.** URLs built from it are root-path (`https://{subdomain}.{base}/webhook`). The root-to-`/s` rewrite happens in the cloud nginx ingress (edge sets `X-Twenty-Public-Domain`), not in app code — the in-app middleware was removed in #22045 on purpose. The Nest server only serves `/s/*`.
2. **Host classification collides.** `getSubdomainAndDomainFromUrl` checks the front domain first. On localhost everything ends with `.localhost`, so any public-domain host parses as a front subdomain and workspace resolution fails. The classifier needs the front and public base hostnames to be disjoint (`twenty.com` vs `withtwenty.com`).
3. **It is a security switch.** An isolated origin forwards all request headers to user-authored function code — including `Cookie` (`filterRequestHeaders`, no strip list) — and allows all response headers. That is safe only because the real public domain is cookieless. Pointing `PUBLIC_DOMAIN_URL` at a host that carries app sessions hands those sessions to function code. This is the exact exposure #22045 was built to remove, so the variable cannot have a default and "set it locally" cannot be the recipe.

## What this PR does today

- Server: when there is no isolated origin, fall back to `SERVER_URL` + `/s`, subdomain-prefixed in multi-workspace mode.
- Front: apply the same subdomain prefixing so Settings and the env var agree.

Honest limitation: this fixes the value at two consumers. The executor and the front util now both compute URLs from topology (`SERVER_URL`, multi-workspace flag, subdomain). That knowledge belongs in the domain layer, computed once.

## Proposal

There are two different questions, and today one nullable method answers both:

1. **"Does this workspace have an isolated public origin?"** Nullable by design. `undefined` is a real state: it gates the header-forwarding semantics and the legacy `/s` deprecation check in `RouteTriggerService`, which relies on `undefined` meaning "no isolated origin exists". This stays as `buildPublicFunctionBaseUrl` (or a clearer name).
2. **"What base URL calls this workspace's functions?"** Total, always has an answer: the isolated origin when configured, otherwise same-site `SERVER_URL/s`. New method `buildFunctionsBaseUrl` on `WorkspaceDomainsService`.

Consumers:

- The executor injects the result of (2) as `TWENTY_FUNCTIONS_URL`.
- The server ships the computed value of (2) to the front (the domain configuration payload already carries `publicFunctionDomain`, so there is a natural slot). The front util's topology logic gets deleted; Settings just displays the server's answer.

## Parity model

- **Capability parity: always.** Functions are callable and the env var is populated on every deployment.
- **Topology parity: opt-in, never faked.** The isolated cookieless domain is an infrastructure feature. Self-hosters who want it provision wildcard DNS and a cert and set `PUBLIC_DOMAIN_URL`. Everyone else gets same-site `/s` with the strict header allow-list. Security posture degrades explicitly instead of being simulated.

Prior art: GitHub Enterprise Server's "subdomain isolation" (off by default; requires wildcard DNS + cert; when off, user content serves same-origin with stricter restrictions) and GitLab Pages (`pages_external_url` is explicit opt-in config). n8n's `WEBHOOK_URL` is the same total-callable-URL concept: server-owned, one source, same-origin default.

## Open questions

1. A self-hoster who sets `PUBLIC_DOMAIN_URL` today still needs the root-to-`/s` rewrite at their own proxy, which is undocumented. Either document the required proxy rule, or restore a host-gated in-app rewrite (when `Host` is under the public function domain, rewrite `/` to `/s` internally) so opt-in isolation works on any infra — the cloud edge rewrite then becomes an optimization. The in-app version was removed deliberately in #22045, so this needs Félix's call.
2. Where exactly the front reads the computed `functionsBaseUrl` from: domain configuration payload vs the workspace query.
