# Changelog

All notable changes to the [Twenty SDK](https://www.npmjs.com/package/twenty-sdk) are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.8.0]

### Breaking Changes

- **`twenty-sdk` must now be a dev dependency.** It ships the `twenty` CLI and the build/scaffolding tooling, which only run at development and build time — it is never imported by a published app's runtime. Newly scaffolded apps already place it under `devDependencies`. Apps created before `2.8.0` must move it when upgrading:

  ```diff
    "dependencies": {
      "twenty-client-sdk": "^2.8.0"
  -   "twenty-sdk": "^2.8.0"
    },
    "devDependencies": {
  +   "twenty-sdk": "^2.8.0"
    }
  ```

  Then reinstall with `rm -rf node_modules && yarn install`. `twenty-client-sdk` stays under `dependencies` because app code imports it at runtime.

  `twenty build` now emits a warning when `twenty-sdk` is still listed under `dependencies`, so existing apps are flagged automatically.
