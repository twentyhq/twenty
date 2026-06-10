# SPIKE: Persistent Dialer Dock (app-shell iframe slot)

**Branch:** `spike/dialer-dock` (off `propel-rls` @ `e7258db3e0` — the lean-v3 staging engine line)
**Date:** 2026-06-10 · **Status:** spike complete, NOT shippable as-is
**Question answered:** can the Twenty fork host a persistent softphone surface that
survives all SPA navigation, and what does the carried patch cost at rebase time?

**Verdict: YES — persistence proven end-to-end with a live SIP registration, and the
patch is 2 upstream lines + 1 new file. Recommendation: carry in fork.**

---

## 1. What was patched

| File | Change | LOC |
|---|---|---|
| `packages/twenty-front/src/modules/dialer-dock/components/DialerDock.tsx` | **new file** — the entire feature | +187 |
| `packages/twenty-front/src/modules/app/components/App.tsx` | import + `<DialerDock />` sibling of `<AppRouter />` | +2 |
| `packages/twenty-front/.env.example` | document the flag | +3 |

**Total: 3 files, +192 LOC. Upstream-owned files touched: 2, with 5 lines.**

The mount point is `App.tsx` — `<DialerDock />` renders as a **sibling of
`<AppRouter />`**, i.e. outside `RouterProvider` entirely. Route changes can't
unmount it by construction. Expand/collapse is CSS-only (`visibility`/size on the
container); the `<iframe>` element is rendered unconditionally and never remounts.

### Flag mechanics

```
REACT_APP_DIALER_DOCK_URL=<softphone URL>   # absent ⇒ component returns null
```

Resolution order (matches the fork's `REACT_APP_SERVER_BASE_URL` convention):
1. `window._env_.REACT_APP_DIALER_DOCK_URL` — Docker runtime injection path
2. `import.meta.env.REACT_APP_DIALER_DOCK_URL` — vite dev (env var or `.env` file)

**Verified zero-behavior-change control:** with the flag unset, the dock node does
not exist in the DOM (0 iframes, 0 console errors, app renders normally).

**Productionization TODO (1 line, not in this patch):** the prod image's
`packages/twenty-front/scripts/inject-runtime-env.sh` writes `window._env_` into
`index.html`; it must be extended to pass `REACT_APP_DIALER_DOCK_URL` through.

## 2. Persistence verdict — PROVEN, with evidence

Method: the served web-harness softphone (`~/dev/softphone-lab/web-harness`) was
loaded in the dock, registered to Telnyx over WSS (`wss://sip.telnyx.me:7443`),
then the CRM was navigated aggressively. Three independent remount detectors were
checked after every hop:

- **DOM identity** — a `data-spike-marker` set on the iframe node (a React remount
  creates a new node and loses it)
- **iframe content identity** — `window.__harnessBootedAt` timestamp inside the
  iframe (any reload re-stamps it)
- **live SIP state** — the harness's `REG:` chip (a dropped iframe loses the
  WebSocket + registration)

Every hop returned: marker intact, identical boot timestamp, `REG: registered`.

| # | Navigation | Result |
|---|---|---|
| 1 | sidebar → People | ✅ |
| 2 | sidebar → Companies | ✅ |
| 3 | sidebar → Tasks | ✅ |
| 4 | → Settings (`/settings/profile`, biggest layout swap) | ✅ |
| 5 | Exit Settings → main app | ✅ |
| 6 | open command palette (⌘K side panel), search, close | ✅ |
| 7 | ⌘K record search → company record page (`/object/company/…`) | ✅ |
| 8 | browser history back (SPA popstate) | ✅ |
| 9 | browser history forward | ✅ |
| 10 | dock collapse → palette interaction → re-expand | ✅ iframe alive while hidden |

**Long-hold evidence:** the registration survived **~1h38m of idle CRM sitting**
(REGISTERED 15:03:57 → still registered at 16:41:27 when deliberately
unregistered) — JsSIP's re-REGISTER refresh kept running inside the dock
across the whole session.

Expected non-survival (by design, not a defect): a full page reload (F5 / `goto`)
resets the iframe like any SPA state. Confirmed during testing.

Screenshots in [`docs/spike-dock/`](docs/spike-dock/):
`dock-collapsed.png`, `dock-expanded-registered.png`,
`dock-mid-navigation-settings.png`, `dock-record-page.png`.

## 3. Mic permission findings (Chrome)

`<iframe allow="microphone; autoplay">` on a cross-origin iframe
(localhost:3001 CRM → localhost:4173 dialer). Measured matrix:

| Scenario | `featurePolicy.allowsFeature('microphone')` | result |
|---|---|---|
| dock iframe WITH `allow` | `true` | permission `prompt` → device flow proceeds |
| control iframe WITHOUT `allow` | `false` | blocked — Chrome console logs `Permissions policy violation: microphone is not allowed in this document` |
| mic granted to **top-level origin** (CRM) | — | dock iframe immediately sees `permissionState: granted` |

Key takeaways:
- The `allow` attribute is **required** — without it Chrome hard-blocks
  `getUserMedia` in the embedded dialer regardless of user wishes.
- **Permission delegation works as needed:** Chrome keys the grant on the
  *top-level* origin (the CRM domain). The user sees one prompt attributed to the
  CRM origin (e.g. `crm.remaxhub.ae wants to use your microphone`), and the
  embedded dialer inherits it. No second prompt, no per-iframe-origin grant.
- `getUserMedia` returned `NotFoundError` in all granted cases here because the
  headless test browser has no mic device — the policy/permission layers (the
  thing this spike tests) are conclusive; a 30-second headed sanity check with a
  real mic is still advisable before calling the prod flow done.

## 4. postMessage click-to-call contract (stretch — wired and proven)

Implemented in `DialerDock.tsx`: any CRM code can run

```js
window.postMessage({ type: 'propel:dial', number: '+9715…' }, window.location.origin);
```

The dock (a) validates the message came from the CRM's own origin, (b) auto-expands,
(c) forwards `{ type: 'dial', number }` into the iframe, targeted at the dock URL's
origin (no `*`). Proven live from a company record page: harness log shows
`dock: dial request from host (http://localhost:3001) → +971501234567` and the dial
target was filled. (The receiving listener was added to the web-harness; the real
dialer app needs the same ~6-line listener.)

This is the seam click-to-call-from-record plugs into later — a phone-field widget
or front-component just posts the message; no further engine changes needed.

## 5. Risks / collisions found

1. **⌘K side-panel pointer collision (real, observed).** Twenty's command palette
   opens as a bottom-right side panel; the expanded dock (z-index 30, above the
   panel's `SidePanel = 21`) **intercepted clicks on palette results**. Playwright
   surfaced it as `iframe … intercepts pointer events`. Fix options for the real
   feature: put the dock *below* the side panel (z ≈ 20, panel covers dock while
   open), or listen for command-menu open state and yield (shift/auto-collapse).
   The Salesforce-style answer — a reserved-height utility *bar* in layout flow
   instead of a floating overlay — eliminates the class entirely but touches
   layout CSS (bigger patch).
2. **SnackBar overlap:** toasts (z 10002) render above the dock in the same
   corner — acceptable (transient), but the dock should probably sit bottom-LEFT
   in production, away from both the palette panel and toasts.
3. **No theme access:** the dock mounts outside `BaseThemeProvider` (which lives
   *inside* the router tree), so it can't read the emotion theme — styles are
   hardcoded dark. Fine for a spike; the real feature should either lift
   `BaseThemeProvider` above the router (slightly bigger upstream diff) or read
   the persisted color-scheme atom directly (jotai store IS available at this
   level).
4. **Dev-env gotcha (cost an iteration):** `REACT_APP_SERVER_BASE_URL` is read
   ONLY from `window._env_`, falling back to hardcoded `localhost:3000` — vite
   process-env does **not** reach it (unlike the dock flag, which reads
   `import.meta.env` and works). On this machine :3000 is the **staging
   container**, so local dev against the :3100 dev backend needs a temporary
   `window._env_` line in `packages/twenty-front/index.html` (left as an
   intentionally **uncommitted** worktree edit; revert with
   `git checkout -- packages/twenty-front/index.html`).

## 6. Rebase burden assessment — NEGLIGIBLE

- `App.tsx`: **6 upstream commits in the last 12 months**, all mechanical
  (jotai migration, package rename). The 2-line insert (1 import + 1 JSX sibling)
  re-applies trivially; worst case is a 30-second manual conflict.
- `.env.example`: 3 commits/year, append-only conflicts.
- `DialerDock.tsx`: new file in its own module dir — **zero conflict by construction**.
- Comparison: the fork already carries `propel-rls` (~59 server files). This adds
  ~3% to the carried surface.

## 7. Recommendation: carry in fork

Carry the patch. It is 5 upstream-file lines behind a flag that defaults off, on a
fork that already carries a much larger custom module. An upstream PR today has no
home: Twenty has **no utility-bar/persistent-surface primitive** and no concept of
an app-shell slot; a PR would have to *introduce* that product concept, which is a
roadmap conversation, not a patch.

**What a PR-able version would look like** (if upstream interest materializes):
a generic `AppShellSlot` mounted exactly where DialerDock is now, populated from
workspace settings (admin configures URL + allow-list + icon), with
`allow`-attribute passthrough and a documented postMessage envelope. Essentially
"Salesforce utility bar, app-shell edition". Our fork patch is the degenerate
single-tenant case of that design, so carrying it now doesn't paint us into a
corner.

## 8. What the popout-dialer app should do to be dock-friendly

1. **Compact layout mode** — render usefully at 360×560 (e.g. `?layout=dock`
   query param): dial pad + active-call card + recents; no nav chrome.
2. **postMessage API** — inbound: `{ type: 'dial', number }` (proven here);
   outbound (new): `{ type: 'call-state', state: 'ringing'|'active'|'idle', number }`
   so the CRM pill can show a badge/timer while collapsed.
3. **Auto-register on load** from stored credentials — the dock loads at CRM boot;
   no human "Connect" click should be needed.
4. **Origin allow-list** for postMessage (accept dial commands only from the CRM
   origin), mirroring what the dock already enforces in the other direction.
5. **Mic pre-flight UX** — on first load, if `permissionState === 'prompt'`,
   show a "enable microphone" call-to-action so the Chrome prompt fires on a
   user gesture (better grant rates than prompting on first incoming call).
6. Keep using **WSS + DTLS-SRTP via the JsSIP receiveRequest DID fix** (see
   `voip-softphone-builder` skill) — unchanged by the dock.

## 9. Reproducing the demo locally

```bash
# backend (main checkout, alternate port — :3000 is the staging container!)
docker start twenty-dev-db-1 twenty-dev-redis-1
cd ~/dev/twenty && NODE_PORT=3100 SERVER_URL=http://localhost:3100 corepack yarn nx start twenty-server

# softphone content
npx serve ~/dev/softphone-lab/web-harness -l 4173

# frontend (this worktree/branch; needs the uncommitted index.html window._env_ tweak, see §5.4)
REACT_APP_DIALER_DOCK_URL=http://localhost:4173 npx nx start twenty-front

# login: tim@apple.dev / tim@apple.dev (seeded dev user; password == email)
```

## 10. Housekeeping notes

- **Rotate the lab webphone SIP credential** (`TELNYX_SIP_USER`/`PASS` in
  `~/dev/softphone-lab/.secrets/telnyx.env`): during automated testing the
  harness's password *field value* surfaced in an accessibility snapshot inside
  the agent transcript. Lab-only credential, but rotate on principle.
- The web-harness gained the dock postMessage listener + boot timestamp
  (`~/dev/softphone-lab/web-harness/index.html`, ~12 lines) — that's the
  test-side half of the contract, kept out of this repo.
- Staging (:3000 container stack) was never written to. One accidental sign-up
  attempt was fired at it before the port mixup was caught; it was rejected
  server-side (`User does not have access to this workspace`) and the staging DB
  was verified clean.
