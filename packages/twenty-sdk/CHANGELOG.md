# Changelog

All notable changes to the [Twenty SDK](https://www.npmjs.com/package/twenty-sdk) are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes

- **`MetadataApiClient.uploadFile` in `twenty-client-sdk` takes one object and no longer accepts a content type.** The file now goes straight to Twenty's file storage (the API issues an upload target, the client sends the bytes there, then the API confirms the upload) instead of being streamed through the GraphQL API, and the MIME type is detected from the bytes on completion. Update every call:

  ```diff
  - const uploaded = await metadataClient.uploadFile(
  -   fileBuffer,
  -   'invoice.pdf',
  -   'application/pdf',
  -   FIELD_UNIVERSAL_IDENTIFIER,
  - );
  + const uploaded = await metadataClient.uploadFile({
  +   fileBuffer,
  +   filename: 'invoice.pdf',
  +   fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  + });
  ```

  The returned `{ id, path, size, createdAt, url }` is unchanged. `uploadFile` now requires a Twenty server that exposes the `createFileUpload` and `completeFileUpload` mutations.

- **Uploading into a files field with an application token needs the same access as attaching the file to a record.** This covers `uploadFile` in `twenty-sdk/front-component`, which now runs as the application acting for the viewer instead of with the viewer's session alone, as well as `MetadataApiClient.uploadFile` in logic functions and direct `createFileUpload` or `uploadFilesFieldFileByUniversalIdentifier` calls. The application's role needs `UPLOAD_FILE` and must be able to update the object owning the field, intersected with the viewer's role when the application acts for one. System objects such as `attachment` and `callRecording` stay exempt, as they are when attaching. A direct upload started by an application can only be completed by that application. Apps whose role lacks either grant now get their uploads refused: add `UPLOAD_FILE` and the object permission to the role.

### Added

- **`uploadFile` in `twenty-sdk/front-component` can fail with `permission-denied`.** The result's `reason` is `permission-denied` when the server refuses the upload because the application or the viewer lacks access, so a component can tell it apart from `upload-failed`.

- **`enqueueJobs` in `twenty-sdk/logic-function`.** Enqueues one run per payload of a single logic function in one call (up to 200 payloads per batch). `retryLimit` and `delayMs` apply to every run in the batch.

  ```ts
  import { enqueueJobs } from 'twenty-sdk/logic-function';

  await enqueueJobs({
    logicFunctionUniversalIdentifier: PROCESS_BATCH,
    payloads: batches.map((batch, batchIndex) => ({ batchIndex })),
  });
  ```

### Deprecated

- **`enqueueJob` in `twenty-sdk/logic-function`.** Use `enqueueJobs` with a one-element `payloads` list instead. `enqueueJob` keeps working for now and will be removed in a future major version.

### Changed

- **`twenty-client-sdk` should now be a dev dependency too.** Although app code imports it (`CoreApiClient`, `MetadataApiClient`, `RestApiClient`), Twenty provides it at runtime — logic functions get it from a generated SDK layer and front components resolve it from server-served modules — so the installed copy is only needed for typechecking and the deploy-time build. Newly scaffolded apps now place it under `devDependencies`. Moving it is recommended (not required: the server already strips it from the deployed runtime), and keeps the installed app leaner:

  ```diff
    "dependencies": {
  -   "twenty-client-sdk": "^2.13.0"
    },
    "devDependencies": {
  +   "twenty-client-sdk": "^2.13.0"
    }
  ```

  `twenty build` now also emits a warning when `twenty-client-sdk` is still listed under `dependencies`.

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
