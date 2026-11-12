# Changelog

All notable changes to the [Twenty SDK](https://www.npmjs.com/package/twenty-sdk) are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **`INBOX_ASSISTANT_MENTION` now writes a canonical assistant reference instead of plain `@Ada` text.** The inbox keeps the saved label and assistant identity when rendering the message. Existing plain text is unchanged. This does not change assistant participation or reply selection for application messages.

### Breaking Changes

- **`STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS` no longer includes `workflow` or `workflowAutomatedTrigger`.** Workflows live in Twenty's core workflow store, and Twenty 2.58 drops these legacy workspace objects from every workspace, along with any relation fields that point at them. Remove references to both identifiers, including relation fields that target them. To ship a workflow with your app, declare it with `defineWorkflow()`.

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

### Removed

- **The per-file multipart fallback in `twenty app deploy` and `twenty app dev`.** Application files are only uploaded straight to file storage now (`createApplicationFileUploads`, PUT, `completeApplicationFileUploads`). The CLI no longer falls back to the `uploadApplicationFile` mutation on a server that lacks the batch mutations, so deploying to a server older than the direct upload fails instead of degrading.

### Added

- **`archiveInboxThread({ threadId, workspaceMemberIds })` archives a conversation your application wrote for the members you name**, as if each had archived it from their inbox. Use it when the work behind a message got done elsewhere, such as an email sent from Gmail. A new message in the conversation brings it back. Leave out `workspaceMemberIds` to mark the conversation done in its channel instead.
- **Message attachments in `twenty-sdk/logic-function`.** `uploadMessageAttachment({ filename, content })` uploads a file for a message and returns `{ fileId, label }`, which `ingestMessages` takes in a message's `attachments`. Twenty stores each file as an attachment record on the message. Attachments are added only while the message has none, so a later delivery can add them but never replaces them, and each `IngestedMessage` now reports `hasAttachments` so a redelivery can skip downloading them again. An uploaded file that no message ends up holding is kept, so upload only for messages without attachments. Uploading needs the `UPLOAD_FILE` permission flag on the app's role. `ingestMessages` itself now reads `hasAttachments`, so every call needs a Twenty server with message attachments, not only uploads.
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

- **`attachRecordToInboxThread` and `detachRecordFromInboxThread` in `twenty-sdk/logic-function` and `twenty-sdk/front-component`.** Link a conversation to a person, company, opportunity or custom object record, or remove the link. Both are idempotent and run like the default API clients: a member must be able to edit the conversation, and your application can act on a conversation it wrote in or one its default role was granted. The record must be readable with the same access.

  ```ts
  import { attachRecordToInboxThread } from 'twenty-sdk/logic-function';

  await attachRecordToInboxThread({
    threadId,
    objectNameSingular: 'company',
    recordId: company.id,
  });
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

- **`eventTriggerSettings` for logic functions and `EVENT` triggers for agents.** With `on: 'recordEvent'`, a trigger names an object, an action and `watchedFieldUniversalIdentifiers` instead of an event name and field names, plus an optional `condition`: a rule expression the record must meet, where `previous.<field>` reads it before an update. The build fails on an unknown object or field, or a condition reading a field the object does not have. These settings need a Twenty server that knows them; to deploy to an older server, keep `databaseEventTriggerSettings`.

  ```ts
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: OPPORTUNITY.universalIdentifier,
    action: 'updated',
    watchedFieldUniversalIdentifiers: [OPPORTUNITY.fields.stage.universalIdentifier],
    condition: "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
  },
  ```

- **`SystemPermissionFlag.USER_APPS` and `SystemPermissionFlag.WORKSPACE_APPS` in `twenty-sdk/define`.** The SDK names of the User Apps and Workspace Apps permission flags, with the same universal identifiers as `CONNECTED_ACCOUNTS` and `APPLICATIONS`. They are left out of `Object.keys`, `Object.values` and `Object.entries`, which list the same 26 names as before, so code that enumerates or filters the flags behaves as before. Only the SDK names change: the API keeps reporting these flags as `CONNECTED_ACCOUNTS` and `APPLICATIONS`, for example in `currentUserWorkspace.permissionFlags` and in command menu expressions.

### Deprecated

- **`databaseEventTriggerSettings` on logic functions and `DATABASE_EVENT` triggers on agents.** Use `eventTriggerSettings` and `EVENT` triggers with `on: 'recordEvent'` instead. The old forms keep working for one more release.

- **`enqueueJob` in `twenty-sdk/logic-function`.** Use `enqueueJobs` with a one-element `payloads` list instead. `enqueueJob` keeps working for now and will be removed in a future major version.

- **`SystemPermissionFlag.CONNECTED_ACCOUNTS` and `SystemPermissionFlag.APPLICATIONS` in `twenty-sdk/define`.** Use `USER_APPS` and `WORKSPACE_APPS` instead. The old names keep working and stay the ones `Object.keys` and `Object.entries` return. In logic functions and front components the new names resolve only when bundled with the `twenty` CLI 2.54 or later.

### Changed

- **A member mentioned in an inbox message is now notified.** `sendInboxMessage` and the Send to Inbox workflow step read the mentions `inboxMention` writes in `text`: each mentioned member gets the conversation in their inbox, unread, with a mention to resolve, without being listed in `workspaceMemberIds`, and the member who owns the conversation can be mentioned too. A mentioned member who cannot have the conversation is skipped, and the message is still written. Mentions are read when the message is written, so once it is, sending it again with the same keys notifies no one; mentions in code or with escaped brackets never notify.
- **`uploadMessageAttachment` sends `content` without copying it.** The bytes go to storage as they are, so uploading a file no longer holds a second copy of it in memory. `MetadataApiClient.uploadFile` in `twenty-client-sdk` now takes any `Uint8Array` as `fileBuffer`; a `Buffer` still works.
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

- **`defineRole` and `defineApplicationRole` keep each permission flag once in `permissionFlagUniversalIdentifiers`.** A flag listed twice, for example under its deprecated and new `SystemPermissionFlag` names, is sent once. Syncing a role with a repeated flag used to fail on the server.

- **`twenty app pull` names permission flags after the app's installed `twenty-sdk`.** Role files get `SystemPermissionFlag.USER_APPS` and `SystemPermissionFlag.WORKSPACE_APPS` with `twenty-sdk` 2.54 or later, and `CONNECTED_ACCOUNTS` and `APPLICATIONS` with earlier versions. A flag the installed `SystemPermissionFlag` lacks is written as its universal identifier string.

- **`twenty app build` and `twenty app dev` keep non-enumerable `twenty-sdk/define` constants in logic function and front component bundles,** so `SystemPermissionFlag.USER_APPS` and `WORKSPACE_APPS` resolve at runtime. Agent role errors also name system permission flags after the app's installed `twenty-sdk`.

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
