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

- **Roles and permission flag definitions report `USER_APPS` or `WORKSPACE_APPS` where they reported `CONNECTED_ACCOUNTS` or `APPLICATIONS`.** Unlike `currentUserWorkspace.permissionFlags`, a role's `permissionFlags { flag }` and `getPermissionFlags { key }`, which callers with an API key, OAuth or app token use to look up flag ids, return only the new key on Twenty 2.53 servers. Code that matches these keys must accept the new and the old one, as in the snippet under Deprecated.

- **App permission flags can no longer use a standard key, including the former `CONNECTED_ACCOUNTS` and `APPLICATIONS`.** Twenty servers reject a `definePermissionFlag` whose `key` is a standard permission flag key or one of those two former keys. Pick a key specific to your app. An installed app flag already keyed `USER_APPS` or `WORKSPACE_APPS` stops the 2.53 upgrade of that workspace until the flag is revoked from every role and the app is uninstalled.

### Removed

- **The per-file multipart fallback in `twenty app deploy` and `twenty app dev`.** Application files are only uploaded straight to file storage now (`createApplicationFileUploads`, PUT, `completeApplicationFileUploads`). The CLI no longer falls back to the `uploadApplicationFile` mutation on a server that lacks the batch mutations, so deploying to a server older than the direct upload fails instead of degrading.

### Added

- **`sendInboxMessage` in `twenty-sdk/front-component`.** A front component can post in members' inbox without a logic function in between. The message is still from your app; the call carries the component's token, so the member looking at the page needs the AI permission too, and an expired token is refreshed once before the call is retried. Open the conversation with `navigate`:

  ```tsx
  import {
    AppPath,
    navigate,
    sendInboxMessage,
  } from 'twenty-sdk/front-component';

  const { threadId } = await sendInboxMessage(message);

  await navigate(AppPath.AiChatInbox, { threadId });
  ```

- **Inbox mention helpers in `twenty-sdk/logic-function` and `twenty-sdk/front-component`.** `inboxMention({ workspaceMemberId })` and `inboxReferenceRecord({ objectNameSingular, recordId })` write the tokens the inbox renders as chips, labeled like the composer labels them: the member's full name, or the record's label identifier. `INBOX_ASSISTANT_MENTION` is the composer's mention of the assistant.

  ```ts
  import { inboxMention } from 'twenty-sdk/logic-function';

  const text = `${await inboxMention({ workspaceMemberId })}, the report is ready.`;
  ```

- **`useSelectedRecordsFilter` in `twenty-sdk/front-component`.** Returns a record filter matching exactly the records the user selected, or `null` when there is no selection context. Under Select all, `useSelectedRecordIds()` is empty because the selection is defined by the view's filters, search and unticked rows; query the records with this filter, or pass it to a logic function. Twenty servers that predate it return `null`.

  ```tsx
  import { useSelectedRecordsFilter } from 'twenty-sdk/front-component';

  const selectedRecordsFilter = useSelectedRecordsFilter();
  ```

- **`enqueueJobs` in `twenty-sdk/logic-function`.** Enqueues one run per payload of a single logic function in one call (up to 200 payloads per batch). `retryLimit` and `delayMs` apply to every run in the batch.

  ```ts
  import { enqueueJobs } from 'twenty-sdk/logic-function';

  await enqueueJobs({
    logicFunctionUniversalIdentifier: PROCESS_BATCH,
    payloads: batches.map((batch, batchIndex) => ({ batchIndex })),
  });
  ```

- **`useSelectedObjectMetadata` in `twenty-sdk/front-component`.** Returns the `id`, `nameSingular` and `namePlural` of the object a front component runs against, such as the object of the current record page, or `null` when there is none. Twenty servers that predate it also return `null`. The return type is exported as `FrontComponentSelectedObjectMetadata`.

  ```tsx
  import { useSelectedObjectMetadata } from 'twenty-sdk/front-component';

  const objectMetadata = useSelectedObjectMetadata();
  ```

- **`USER_APPS` and `WORKSPACE_APPS` permission flag keys.** The new names of the User Apps and Workspace Apps permission flags, formerly `CONNECTED_ACCOUNTS` and `APPLICATIONS`, with the same universal identifiers: `SystemPermissionFlag.USER_APPS` and `SystemPermissionFlag.WORKSPACE_APPS` in `twenty-sdk/define`, and new values of `MetadataSchema.PermissionFlagType` and `MetadataSchema.enumPermissionFlagType` in `twenty-client-sdk`. Twenty provides `twenty-client-sdk` at runtime, so these `enumPermissionFlagType` values are `undefined` on servers before 2.53; compare string literals as in the snippet under Deprecated.

### Deprecated

- **`enqueueJob` in `twenty-sdk/logic-function`.** Use `enqueueJobs` with a one-element `payloads` list instead. `enqueueJob` keeps working for now and will be removed in a future major version.
- **`SystemPermissionFlag.CONNECTED_ACCOUNTS` and `SystemPermissionFlag.APPLICATIONS` in `twenty-sdk/define`.** Use `USER_APPS` and `WORKSPACE_APPS` instead. The old names are aliases with the same universal identifiers, left out of `Object.keys` and `Object.values`. They keep working for now and will be removed in a future major version. In logic functions and front components they resolve only when bundled with the `twenty` CLI 2.53 or later; earlier CLIs drop them, so use the new names in runtime code.
- **The `CONNECTED_ACCOUNTS` and `APPLICATIONS` permission flag keys at runtime.** Twenty 2.53 servers report both the new and the old key in `currentUserWorkspace.permissionFlags` and accept either key in `upsertPermissionFlags`. The old keys stay in `MetadataSchema.PermissionFlagType` and `MetadataSchema.enumPermissionFlagType` of `twenty-client-sdk` and are deprecated in the GraphQL schema. A later release stops reporting and accepting them. Check the new key and fall back to the old one for servers before 2.53:

  ```ts
  const permissionFlags: string[] =
    currentUser.currentUserWorkspace?.permissionFlags ?? [];
  const canManageApps =
    permissionFlags.includes('WORKSPACE_APPS') ||
    permissionFlags.includes('APPLICATIONS');
  ```

- **`permissionFlags.CONNECTED_ACCOUNTS` and `permissionFlags.APPLICATIONS` in command menu expressions.** They keep evaluating on 2.53 servers until the old keys are removed. Switch `conditionalAvailabilityExpression` and `conditionalPinnedExpression` in `defineCommandMenuItem` to `permissionFlags.USER_APPS` and `permissionFlags.WORKSPACE_APPS`, or to `permissionFlags.WORKSPACE_APPS or permissionFlags.APPLICATIONS` while you support servers before 2.53. The server upgrade rewrites standard and workspace-custom command menu items, not items an app defines.

### Changed

- **`sendInboxMessage` runs like the default API clients.** It now sends through `MetadataApiClient`, so in a logic function it acts as the person who triggered the run, who then needs the AI permission, and as your application only when nobody did; it used to always use the application's access. A GraphQL error now rejects with the server's message instead of `sendInboxMessage() failed: ...`. Its input and result are unchanged.
- **`twenty app deploy` sends the tarball straight to file storage.** The CLI reserves an upload with `createFileUpload`, PUTs the archive to storage and registers it with `completeAppTarballUpload`, so the tarball no longer transits through the API process. Deploying to a server that predates these mutations fails instead of falling back to the multipart `uploadAppTarball` mutation.
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

- **`defineRole` and `defineApplicationRole` reject a permission flag listed twice in `permissionFlagUniversalIdentifiers`.** Syncing such a role already failed on the server. A deprecated `SystemPermissionFlag` name and its replacement are the same flag.
- **`twenty app pull` names permission flags after the app's installed `twenty-sdk`.** Role files get `SystemPermissionFlag.USER_APPS` and `SystemPermissionFlag.WORKSPACE_APPS` with `twenty-sdk` 2.53 or later, and `CONNECTED_ACCOUNTS` and `APPLICATIONS` with earlier versions. A flag the installed `SystemPermissionFlag` lacks is written as its universal identifier string.

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
