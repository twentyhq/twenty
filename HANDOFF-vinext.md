# Running the vinext website

Worktree: `/Users/huzef/Documents/projects/twenty-website-vinext`
Branch: `chore/website-vinext` (based on `origin/main` @ `ef0d7c1599`)
Package: `packages/twenty-website`

The site was migrated from Next.js + OpenNext to **vinext** (Cloudflare's Next
API reimplemented as a Vite 8 / Rolldown plugin). Nothing is committed.

## Run it

```bash
cd /Users/huzef/Documents/projects/twenty-website-vinext/packages/twenty-website

# dependencies (worktrees do not share node_modules)
yarn install
npx nx build twenty-shared    # lingui.config.ts imports from its dist
npx nx build twenty-ui        # models/tokens import from its dist

# production build + serve
yarn build:vinext
TWENTY_PARTNERS_API_URL=https://partners.twenty.com \
TWENTY_PARTNERS_API_KEY=unused \
  npx vinext start --port 3010
```

`TWENTY_PARTNERS_API_KEY` is any string: `/s/partners` and `/s/partner-by-slug`
are `isAuthRequired: false` and return 200 with no key, a garbage key, or an
empty one. Without `TWENTY_PARTNERS_API_URL` the partners directory renders its
empty state instead of failing.

`yarn dev:vinext` (port 3001) currently 404s every route, including plain route
handlers. Not diagnosed. Use the production build.

## What the migration needed

Next drove Linaria through webpack and the Lingui macro through SWC. Neither
pipeline exists under Vite, so `vite.config.ts` re-declares both. Four things
there are load-bearing and each has a failure behind it:

- **`enforce: undefined` on the wyw plugin.** wyw ships at `enforce: 'post'` and
  signals its CSS by appending `import "<module>.wyw-in-js.css"`. plugin-rsc
  scans the server graph for stylesheets *before* post transforms run, so on a
  server component that import is never seen and the emitted stylesheet is never
  linked. Client components are unaffected — their CSS comes from the client
  bundle graph, which sees imports added at any stage. Symptom when wrong: page
  renders in Times with no reset, ~56 of 87 stylesheets emitted but unlinked.
- **`lowerSyntaxAfterLinaria`**, a second `@rolldown/plugin-babel` pass ordered
  after wyw. wyw emits the original on-disk source minus the styled templates,
  discarding upstream transforms, so its output is TS/JSX again. The rsc and
  client environments lower that afterwards; ssr does not. `reactCompilerPreset`
  scopes itself to `consumer === 'client'`, so the syntax presets cannot ride
  along with it and are declared separately. Removing this fails the build with
  `PARSE_ERROR`.
- **`importOverrides` on wyw**, stubbing `next/link` and the plugin-rsc server
  entries. Linaria computes CSS by executing the module graph and resolves
  `next/link` in the RSC environment regardless of the importer's `'use client'`
  directive, reaching the React Server runtime, which throws without the
  `react-server` condition. Needs `@wyw-in-js` >= 1.1.0; 0.8.x ships the type
  with no implementation, so the option silently does nothing.
- **`react: false` on `vinext()`**, because `react()` is registered manually so
  the Lingui macro and React Compiler passes can attach.

`wyw-in-js.config.cjs` was deleted: the docs call `@wyw-in-js/babel-preset` "a
deprecated compatibility wrapper" that bundler plugins do not use.

## Deploying

`open-next.config.ts` is gone. vinext deploys with
`npx @vinext/cloudflare deploy`, and `wrangler.jsonc` was rewritten for Workers
KV (data cache) + Workers Cache (route ISR) instead of the R2 incremental cache.

Two things are unresolved:

- `dist/client/wrangler.json` is emitted without a `main`, so
  `wrangler dev --config` cannot boot it. `vinext start` works.
- OpenNext's skew protection (50 versions / 14 days, `WORKER_SELF_REFERENCE`,
  the `x-deployment-id` handler) has no vinext equivalent and was dropped.

`deploy-website.yaml` in `twentyhq/twenty-infra` runs
`opennextjs-cloudflare build && deploy` and would need rewriting.

## Model pipeline (reconciled)

three.js was replaced with **OGL** in this same worktree.
`src/platform/visuals/three-runtime/` is gone, replaced by `gl-runtime/`, and
`scripts/build-model-geometry.mjs` converts the `.glb` sources into a flat
`.geo` binary (`TWGE`) that drops `GLTFLoader` (115KB) for `MeshoptDecoder`
(26KB). Source configs reference `.geo`.

The collision between that and `optimize-models.mjs` is resolved:

- `assets/models/*.glb` are now **build-time sources only**, moved out of
  `public/` (they were deploying alongside the `.geo` — 10MB of models for 5MB
  of used bytes).
- `build:vinext` runs `build-model-geometry.mjs`, not `optimize-models.mjs`.
- `optimize-models.mjs` stays as a one-off repo-size tool pointed at
  `assets/models`. It is no longer a build step; it was recompressing the
  inputs on every run.
- `.geo` output is gitignored.

**The quantization warning applies to the `.geo` encoder too, and it was
violated.** The first version filtered positions through
`encodeFilterExp(..., 15)` before the vertex codec. Normals are derived from
those positions at load, so the error lands exactly where it does with
`quantize()`. Measured against the unquantized merge:

```
                 max normal error   verts >1deg
exp15  0.55x glb      24.808 deg      140 (1.86%)   <- padlock
exp20  0.64x glb       1.076 deg        1
none   0.74x glb       0.024 deg        0
```

The padlock and diamond were the two worst cases — the same two shapes the
`meshopt --level high` experiment destroyed. Positions now go through the
vertex codec **unfiltered**: bit-exact round-trip (`posErr = 0.0`), 4% smaller
than the source glb rather than 45%. The remaining 0.02deg is float32 noise
from computing normals twice, not a data difference.

So the rule generalises: **never quantize positions anywhere in this pipeline**,
whether via gltf-transform's `quantize()` or meshopt's exponential filter. Use
`EXT_meshopt_compression` / `encodeVertexBuffer` alone. Verified separately:
codec alone is -72% on the sources (19MB -> 5.3MB) and renders identically to
prod; `meshopt --level high` is -93% and destroys the shapes.

### Models ship gzipped in-file

`.geo` is gzipped by the build and inflated in the loader with the browser's
native `DecompressionStream('gzip')`. Cloudflare only compresses an allowlist
of content types, and `application/octet-stream` is not on it — the same reason
prod serves `.glb` with `content-encoding: NONE`. Compressing inside the file
takes the CDN out of the equation.

Home page model transfer: **1298KB -> 687KB**. Visual battery coverage figures
are unchanged to one decimal, so no geometry moved.

### Why simplification is not used

Worth recording so nobody retries it. `meshopt_simplify` collapses nothing on
these meshes:

```
footer            155,024 verts   39,710 unique positions (25.6%)
why-twenty-hero   270,094 verts   44,587 unique positions (16.5%)
```

They are unwelded, so every edge reads as a border and the simplifier stops
immediately at any target ratio (measured: 0 triangles removed on
why-twenty-hero). Welding by position first would unblock it, but 90% of the
coincident-vertex groups differ by more than 5 degrees of computed normal, up
to 180 — those are genuine creases on an extruded logo, and merging them
rounds the edges off. Re-welding with an angle threshold plus a smoothing-group
split in the loader would work, but it changes shading and needs an A/B against
prod first.

**Still open:** `dist/` predates all of this — it was built before the OGL
source changes and still references `.glb`. Rebuild before trusting it.

## Performance

Lighthouse mobile, home page, median of 3: **80** (prod Next build scores 63).
FCP 3.2s and LCP 4.1s still miss the 90 threshold; TBT, CLS and Speed Index pass.

LCP is 85% Render Delay on an `<h1>` — no resource to fetch, just main thread.
`framework-*.js` alone is ~2.5s of scripting on 4x throttled CPU across 245
`'use client'` components. Chunk merging cannot help: plugin-rsc emits one chunk
per client reference by design, and `cssCodeSplit`, `experimentalMinChunkSize`
and `advancedChunks`/`codeSplitting` were all measured as no-ops.

Untracked measurement scaffolding, not for shipping: `h2-proxy.mjs` and
`compress-proxy.mjs`. `vinext start` serves static assets uncompressed while
Cloudflare brotlis them, and Lighthouse over HTTP/1.1 penalises the request
count, so measuring the origin directly understates the deployed site by ~20
points. `h2-proxy.mjs` serves HTTP/2 + brotli on `https://localhost:3021`.

## Independent of the migration

- **`partnersApiFetch` caching was removed** — this shipped to prod separately
  and fixed the 403 partner logos.
- **Barrel import fix**: `MenuDrawer.tsx` and `MenuSocial.tsx` imported
  `useLocale` from `@/platform/i18n`, whose barrel also re-exports
  `MESSAGES_BY_LOCALE` and statically pulls all 14 locale catalogs into the
  client bundle. Deep-importing `@/platform/i18n/use-locale` cuts home-page JS
  from 1198KB to 437KB gzip. This works on prod today with no migration.
- **Prod serves `.glb` with `content-encoding: NONE`** — Cloudflare is not
  compressing `model/gltf-binary`. Roughly -44% on the originals for a config
  change.
- **`favicon.ico` was 174KB** (9 sizes up to 256px), rebuilt as 16+32 at 2KB.

## Unverified

- `HomeStepperLottieSlot` and the Terminal viewport gating changed rendering
  behaviour and were not checked at >=1350px.
- **`compileAsync` was lost in the OGL port and is not recoverable as-is.**
  three's `renderer.compileAsync` handed linking to
  `KHR_parallel_shader_compile`; ogl's `Program` constructor calls
  `getProgramParameter(LINK_STATUS)` immediately (`Program.js:84`), which
  blocks until the driver finishes, so there is no async seam to use.
  Partly mitigated by accident: the model sessions now `await` the environment
  texture fetch before constructing any `Program`, so their link stall lands in
  a post-fetch task rather than inside hydration. The image and card sessions
  (the LCP path) are still fully synchronous and do link during mount, though
  their shaders are far smaller than the transmission material that made the
  -130ms worth measuring. Restoring it means either deferring `new Program()`
  behind a frame, or patching ogl's link check — public-domain and ~10 lines,
  but neither was measured, so neither was done blind.
- The whole OGL port is **unverified in a browser**: `vinext dev` 404s, so
  `scripts/visual-battery.mjs` could not run. Typecheck, `check-conventions`
  and the 37 visual unit tests pass; geometry fidelity was verified numerically
  against the unquantized merge.
- The glass material's envMap uses a box-filtered mip chain in place of PMREM's
  GGX prefilter (`gl-runtime/load-glass-environment.ts`). Affects the `helped`
  section only.
