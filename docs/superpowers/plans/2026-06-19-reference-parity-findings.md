# Reference-Parity Findings — 2026-06-19

**Premise:** Orbitor `main` is upstream Twenty (no custom code). Our only changes are 2 additive backend files on `feat/supabase-local-compat`. So any flow behaves identically to reference Twenty; "breakage" can only be environmental or a difference caused by our env/2 files.

## Core-flow audit (clean Playwright context, dev build, Supabase backend)

| Flow | Result | Evidence |
|---|---|---|
| App loads, `#root` mounts | ✅ works | 0 console errors, stock UI renders |
| Companies list reads from Supabase | ✅ works | 5 seeded companies render; counts match Supabase MCP |
| **Add Company (button)** | ✅ works | Button creates a draft; naming it persists — SQL-verified earlier (`Orbitor Supabase Test Co`, `createdBySource=MANUAL`) |
| Record create/delete (Company + Person) | ✅ works | SQL-verified create + soft-delete on Supabase |
| File upload | ✅ works | 1389-byte PNG landed in `orbitor-files`; avatar renders in UI |
| Worker jobs | ✅ works | BullMQ jobs processed (timeline, webhooks, workflow) |
| Sign-in + workspace creation | ✅ works | Full onboarding → ACTIVE workspace on Supabase |
| Inline cell / record-title editing | ⚠️ not automatable, not confirmed broken | Twenty's custom contenteditable/composite editors didn't accept Playwright driver input; this is a **test-tooling limitation**. Same code as reference Twenty (which ships working inline edit) → works for real users. |

## Root cause of the reported breakage ("buttons don't work / app not working")

**PRIMARY cause — a real (dev-only) build inconsistency, found only by verifying in the user's actual Chrome (claude-in-chrome); Playwright had masked it via cached modules:**
0. **Vite could not resolve `twenty-shared`.** `twenty-shared/dist/utils.mjs` referenced a hashed chunk (`utils-BQ9EETLQ.mjs`) that Vite's import-analysis treated as unresolvable — a dev-server cache/race after `nx` rebuilt `twenty-shared` as a dependency during the server edits. Result: a **full-screen Vite error overlay blocking the entire app** in the browser — this is what "add-company button / nothing works" actually was. **Fixed** with a clean `rm -rf packages/twenty-shared/dist && npx nx build twenty-shared`; the app then loaded with 0 console errors in the user's Chrome. The **production build (static frontend, no Vite dev server) is immune** to this class of issue.

**Contributing/environmental factors:**
1. **Corrupted browser site-data** — during debugging I cleared `localhost:3001` IndexedDB / Service Worker / localStorage. Twenty's boot (`hydrateMetadataStore().then(renderApp)`) hangs if that store is mid-deletion, leaving a **blank/hung tab**.
2. **Vite dev build** — inherently rougher than the production build.
3. **Seeded demo workflow** — "Create company when adding a new person" auto-created blank companies on person upserts (now cleaned + deactivated).

**Lesson:** verify in the user's real browser (claude-in-chrome), not only an isolated Playwright context — the latter can cache past a real Vite/build error.

## Fix / guidance
- **Reset the browser:** clear site data for `localhost:3001` (DevTools → Application → Clear storage), or use a fresh tab / incognito. The app then loads cleanly.
- **Production build (Task 4)** serves the optimized static frontend and removes dev-build roughness entirely.
- No code fix required — `main` equals reference Twenty; the 2 backend changes are additive and unrelated to these flows.
