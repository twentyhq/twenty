# ReevoCrm patches

`ReevoMY/twenty` is a public fork of [twentyhq/twenty](https://github.com/twentyhq/twenty), licensed under the AGPLv3 like upstream (see `LICENSE`). This file lists every change we make to Twenty. Fork-only files live in `reevo/`.

## Branches

| Branch | Content |
| --- | --- |
| `main` | Mirror of upstream `twenty/main`. Never commit here. |
| `develop` | `main` plus the patches below. Merge `twenty/main` into it to update. |

## Rules

1. Keep upstream files as they are. Prefer, in order: configuration, new files in `reevo/`, build-time changes from `reevo/`, and only then a small edit to an upstream file.
2. One commit per patch, with the patch ID in the message (`P1: ...`).
3. Never open, copy or edit a `/* @license Enterprise */` file.
4. After each merge of `twenty/main`, run `node reevo/brand/apply-brand.mjs --check`. It fails if upstream moved any text the brand overlay relies on.

## Patches

| ID | Patch | Status | Upstream files edited |
| --- | --- | --- | --- |
| P1 | Remove the 5-workspace cap without an Organization key | Done | `packages/twenty-server/src/engine/core-modules/auth/constants/max-workspaces-without-organization-key.constants.ts` (one line) |
| P2 | Enterprise files: off by configuration now; removal from the fork later | Interim | None |
| P3 | Rebrand at build time (`reevo/brand/`) | Done, placeholder brand | None |

### P1: no workspace cap

`MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY` is `Number.POSITIVE_INFINITY`, so the check in `sign-in-up.service.ts` never refuses a new workspace. The service itself is unchanged. Who may create workspaces is still governed by `IS_MULTIWORKSPACE_ENABLED` and `IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS`.

### P2 (interim): Enterprise features off

The Enterprise files are still in this branch. Twenty's commercial licence (end of `LICENSE`) allows them without a subscription for development and testing only. Some run on every request even when no feature is switched on, so **an image built from this branch is for development and testing only, never for production or customers**, until the files are removed.

Every deployment runs `node reevo/enterprise/check-enterprise-off.mjs` (or `--env-file <file>`). It fails if the configuration sets an Enterprise key, enables billing, Stripe, Cloudflare domains, JWT key rotation, feature-flag management or a non-`LOG` emailing-domain driver.

Removal from the fork (delete the files, cut the wiring in the AGPL files that import them) is planned feature by feature before the first production deployment.

### P3: brand at build time

`reevo/brand/apply-brand.mjs` rewrites a fixed list of strings (`rules.json`) and replaces asset files (`assets/`) in a throwaway checkout, right before the image build. The upstream Dockerfile is used unchanged:

```bash
node reevo/brand/apply-brand.mjs
docker build --target twenty -f packages/twenty-docker/twenty/Dockerfile .
```

Brand values are in `brand.json`. The current values are a placeholder ("ReevoCrm") until the brand is chosen. The image build re-extracts and compiles translations, so changed strings fall back to English in other languages until they are translated. Set the sender name with `EMAIL_FROM_NAME` at deploy time.

Not covered yet: `twenty.com` links in settings and app-development pages; Twenty's DPA template (Settings, Legal); the GDPR and SOC 2 badges on onboarding; the MCP connector texts that name Twenty's official integrations.
