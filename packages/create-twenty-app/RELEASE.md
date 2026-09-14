# Releasing create-twenty-app

`create-twenty-app`, `twenty-sdk`, `twenty-client-sdk` and `twenty-ui` are
released together at one version, and the scaffolded project pins all three
libraries to that exact version.

Most package managers can be configured to refuse versions published within the
last N days — Yarn's `npmMinimalAgeGate`, pnpm's `minimumReleaseAge` (on by
default at one day), npm's `min-release-age`. Immediately after a release the
libraries are minutes old, and an exact pin gives the resolver no older
candidate to fall back to, so a generated project fails to install with:

```
YN0016: twenty-ui@npm:<version>: All versions satisfying "<version>" are quarantined
```

Publishing the libraries earlier does not fix this: the consumer chooses the
delay after we publish, so no release schedule can satisfy it.

The fix is to ship a lockfile inside the template. A resolved lockfile entry is
never re-resolved, so the gate — which only applies during resolution — never
comes into play, while the user's policy stays in force for everything they add
afterwards. The lockfile must be generated against the **public** registry once
the libraries are live, which is why it is a release artifact rather than a
committed file.

## Order of operations

1. Publish `twenty-client-sdk`, `twenty-ui` and `twenty-sdk` at the release version.
2. Wait until each is actually served by the registry.
3. Build `create-twenty-app`.
4. Generate the template lockfile:

   ```bash
   npx nx run create-twenty-app:generate-template-lock --releaseVersion=<version>
   ```

   It writes `dist/constants/template/yarn.lock` and fails if any first-party
   package is missing, resolved without an integrity checksum, or resolved from
   a local registry.

5. Publish `create-twenty-app`.

Steps 1–5 are automated in `twentyhq/twenty-infra`'s `publish-npm-packages.yaml`.

## If the lockfile is missing

A `create-twenty-app` build with no generated lockfile still scaffolds working
projects — they just resolve dependencies on first install, and so are exposed
to the failure above. The publish workflow refuses to release in that state.
