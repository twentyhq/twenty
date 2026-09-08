# Twenty

See upcoming meetings, record calls, and open transcripts and summaries in your Twenty workspace.

Twenty brings your calendar and recording controls to your desktop. Join upcoming meetings, capture unscheduled conversations, and keep recordings connected to the workspace you choose. A native menu keeps your next meeting and recording controls within reach while you work.

## What you can do

- **See what's next.** Home shows your next three calendar events, with an option to see more. The native menu shows meeting titles, times, and shortcuts to join.
- **Join on time.** Open a meeting yourself or let auto-join open its link when the event starts. You can skip auto-join for an individual event; the meeting provider may still require confirmation to enter.
- **Record scheduled and unscheduled conversations.** Twenty records conversations, including Discord calls, using your microphone and system audio. A separately installed Call Recorder can continue handling calendar meetings with a bot.
- **Stay in control.** Start, pause, resume, and finish desktop recordings. Automatic recording of detected calls is optional and off by default.
- **Continue in Twenty.** Browse recent recordings or search your recording list, then open the recording directly in Twenty to access its audio, transcript, and AI summary when enabled.

## Requirements and setup

This is an Electron development build for **Apple Silicon Macs running macOS 14.2 or newer**. Windows and Linux builds are planned; recording and packaging for those platforms are not implemented yet.

1. A workspace administrator installs the independent Desktop Recorder integration and configures Recall. See [Workspace setup](#workspace-setup).
2. Open Twenty, enter your workspace URL, and sign in through Twenty in your browser. After authorization, Twenty comes to the foreground automatically; the browser callback tab can be closed.
3. Grant microphone, system audio, and meeting-detection permissions in the guided setup.
4. Connect a calendar in Twenty to see upcoming events, or choose **New recording** to capture an unscheduled conversation.

The app uses your connected workspace's calendar and recording settings. Desktop recording requires an internet connection; AI summaries also require AI to be configured in Twenty. Let participants know when you record.

Open the main window from Raycast, Finder, the Dock, or **⌘⇧Space**. Closing the window keeps the app running in the menu bar; quitting stops it.

## Desktop flow

- Setup follows Connect → Permissions → Ready. Microphone, system audio, and meeting detection each have their own explanation and enable action. Continue requires all three permissions; completing setup never starts recording.
- Permission denial opens the corresponding system pane. Returning to the app refreshes permissions without interrupting capture.
- General settings include System/Light/Dark appearance, launch at login, and the meeting countdown beside the tray icon. Hiding the countdown keeps the recording and paused indicators visible. Appearance also applies to native Electron UI. Preferences persist locally; older installations retain their choices and receive defaults for new controls.
- Meetings settings include auto-join, automatic desktop recording, and call-detection notifications. Turning off call-detection notifications leaves detection and recording-interruption alerts active. The Speaker tags row reflects meeting-detection permission. Calendar settings opens the connected Twenty workspace's accounts page; Recording permissions opens the existing full permission checklist.
- The top-left workspace dropdown displays the workspace logo when available, falls back to the Twenty icon, and includes Settings, refresh, opening Twenty, and disconnect. The header has no Home tag. The dropdown supports keyboard navigation, Escape, and dismissal outside the menu.
- Home shows the next three events grouped by local calendar day, with large day numbers and meeting time ranges, followed by recordings. See more expands the event list when additional meetings are available. View all opens the searchable recordings library. Clicking any recording opens its record directly in the connected Twenty workspace, including processing or failed recordings. Finishing capture keeps the current page open and updates the recording status in the list.
- Pause and Resume control the same Recall recording. The timer excludes paused time. Finish works while paused; failed pause/resume requests retain the actual previous status.
- The main window uses normal native window controls and remains visible after losing focus. The native meeting menu shows the next three events grouped by local day, with titles and time ranges, Now/starting-soon context, per-meeting Join and Skip auto-join actions, and calendar recording policy. A direct Join action appears when exactly one meeting is imminent and no call is active. View calendar opens Home. macOS 14.4+ uses native sublabels; other platforms keep timing inline. Launch at login remains in Settings. File → Meeting menu (⌘/Ctrl⇧M) opens the same menu when the tray icon is hard to reach. Native actions use the same recording and meeting commands as the main window. Menu updates wait until an open menu closes to preserve keyboard selection.
- Controls, cards, tags, avatars, and interface typography use Twenty UI directly in both themes. Emphasized actions use its blue primary accent. All typography uses Inter. Native popover positioning, desktop layouts, and the onboarding cloud are desktop-specific compositions using shared tokens. See [Design system](DESIGN_SYSTEM.md) for component boundaries and verification.
- Transcripts and summaries open in Twenty’s standard Call Recording view. This iteration does not add Granola's note editor, AI chat, or folders.

The behavior reference is [Granola's desktop overview](https://docs.granola.ai/help-center/getting-started/granola-101) and [pause/resume interaction](https://docs.granola.ai/help-center/taking-notes/transcription), plus the live permissions screen. Desktop auto-recording is controlled by Twenty’s local preferences.

## Recording behavior

- **Optional calendar bot:** A separately installed Call Recorder can schedule bots independently. Twenty does not require it and uses its own backend, while both apps store results in Twenty's standard `callRecording` object.
- **Auto-join:** enabled by default. The companion opens the user's meeting link at its start time. A provider's pre-join or waiting-room confirmation may still require the user. It never turns the camera or microphone on. Stale agendas, overlapping meetings, an active call, and per-meeting skips prevent an automatic opening.
- **Desktop capture:** Recall's native SDK records supported detected calls. Automatic desktop recording is opt-in. Scheduled meetings on platforms that have no calendar bot can use desktop capture when automatic recording is enabled locally.
- **Discord and other audio:** choose **New recording**, then **Finish**. This captures system audio and microphone; Discord detection and participant names are not promised. Avoid playing unrelated audio during capture. Audio-only capture has no video.
- The desktop and authenticated backend reserve identified scheduled bot meetings for the bot. An unrelated calendar event does not block manual system-audio recording. Manual capture records all computer audio, so do not start it for a meeting already being recorded by its calendar bot.
- Participants should be told when recording. Capture requires macOS permissions. A network loss stops capture; restart it after reconnecting. There is no offline recording or automatic restart after a network loss.
- Completion, media import, transcript generation, and summaries use the independent Desktop Recorder integration. Desktop sessions additionally retain their owner and Recall upload ID. Missed completion webhooks are recovered by a bounded maintenance job. The shared credit-charging path has unresolved issues listed under [Verification boundary](#verification-boundary).

## Architecture

```text
Electron renderer → validated IPC → Electron main process
                                 ├─ macOS Keychain-backed OAuth storage
                                 ├─ Twenty OAuth discovery + PKCE + loopback callback
                                 └─ Recall Desktop SDK ← short-lived upload token

Desktop Recorder authenticated /companion/desktop route
  ├─ personal calendar channels and agenda (runAs: user)
  ├─ recording ownership and active calendar-bot checks
  └─ Recall SDK upload creation (server-held API key)

Recall signed webhooks → Desktop Recorder durable importer → CallRecording
```

No Recall API key or Twenty OAuth token is exposed to the renderer. OAuth tokens are encrypted using Electron `safeStorage`; only the main process can read them. Function domains and frontend workspace links are discovered from the authenticated Twenty server, including hosted isolated function domains.

## Development

Use Node 24 and the repository's Yarn version. Desktop is the `@twentyhq/companion` Yarn workspace and `twenty-companion` Nx project. Install from the repository root; the root lockfile owns desktop, Twenty UI, and their dependencies. Do not install a separate desktop dependency tree.

```sh
yarn install --immutable
yarn workspace @twentyhq/companion dev
```

`dev` shares the production Electron build configuration and watches main/preload dependencies. A successful rebuild requests a graceful Electron restart; capture startup, active or paused recording, and stopping defer it until idle. Repeated rebuilds use the latest successful output. Failed compilations leave the running app untouched. Renderer edits continue to use Vite. Quitting Electron closes the watcher and Vite server.

`yarn workspace @twentyhq/companion preview` serves the renderer at `http://127.0.0.1:4317`. Use `?preview` for an interactive sample Home, `?preview=welcome` for the full setup, `?preview=permissions` for permission setup, `?preview=denied` for denial, or `?preview=recording` for active capture controls. The native menu is available only in the desktop app. Preview actions simulate state transitions; no audio is captured, no workspace writes or external calls are made. This mode is excluded from production. Stop the preview before running the desktop `dev` command, which uses the same port.

From the repository root:

```sh
yarn workspace @twentyhq/companion typecheck
yarn workspace @twentyhq/companion test
yarn workspace @twentyhq/companion build
yarn workspace @twentyhq/companion package
"packages/twenty-companion/release/Twenty-darwin-arm64/Twenty.app/Contents/MacOS/Twenty" --smoke
```

The equivalent Nx project targets are `twenty-companion:build`, `:typecheck`, and `:test`. Native packaging targets are uncached and run only when requested. Desktop imports the current Twenty UI workspace source through Vite aliases; its explicit workspace dependency provides the shared dependency graph.

Root installs keep native install scripts disabled. `dev`, `start`, `package`, and `package:archive` run `native:setup`, which downloads missing Electron and Recall binaries on Apple Silicon macOS. Typecheck, unit tests, renderer preview, and JavaScript builds do not require these downloads.

Packaging stages only `dist`, native image assets, a runtime manifest, and Recall's resolved runtime dependencies in a temporary directory. It never packages the workspace `node_modules` tree. Recall's binaries and frameworks remain outside ASAR; the staging directory is removed after packaging.

The smoke command uses a temporary user-data directory, checks secure IPC in the single main window and construction of the native tray menu, initializes the native Recall SDK without requesting recording permissions, and exits. It does not record audio or launch a meeting bot. Quit a running normal copy before using it.

The package command verifies Recall's executable is outside the ASAR archive. The generated `.app` is a local unsigned development build, not a notarized distribution. Apple signing, notarization, a release update channel, and supported-provider recording checks are required before distributing to users. Follow Recall's current signing instructions for its embedded executable and frameworks.

## Workspace setup

The backend is [Desktop Recorder](../twenty-apps/public/companion/README.md), an independently installable Twenty application. It owns `/companion/desktop`, the `companionSession` ownership field, import/recovery functions, its summarizer agent, and Recall credentials. Follow its [setup instructions](../twenty-apps/public/companion/SETUP.md). Call Recorder is optional.

The native app's OAuth client provides browser sign-in; it does not install the backend integration. An administrator installs the integration in each target workspace. New desktop requests use only the desktop route and fields. Existing completed desktop recordings can be transferred using the integration's one-time migration script without replacing their media or record IDs.

## Code structure

- `src/main/companion.ts` owns workspace and recording state. Only the main process holds credentials and Recall upload tokens.
- `src/main/twenty-client.ts` discovers the workspace endpoint, refreshes OAuth credentials, and validates backend responses. Credential writes are serialized so sign-out wins over an in-flight refresh.
- `src/shared/types.ts` defines the IPC commands, response schemas, and state types. Settings commands carry patches; the main process merges and persists them in order.
- `src/renderer/CompanionApp.tsx` composes the shell. `Onboarding`, `Home`, `Recordings`, and `Settings` own their screen layout and local UI state, using the same shared controls.
- `HalftoneBackground` renders the bundled cloud photo through the image-only Halftone Studio shader in `halftone.ts`. The image covers the full window with centered cropping. Dash spacing stays fixed in CSS pixels while power and a soft contrast wave animate, with sparse drifting particles. It stops rendering when hidden or reduced motion is enabled, releases GPU resources on unmount, and leaves the normal background if WebGL is unavailable.
- The Desktop Recorder integration owns persistence, processing, and its Twenty billing calls. Lifecycle updates use conditional status filters; a stale webhook or recovery job cannot move a completed recording back to processing.

Capture controls remain visible until Recall acknowledges a stop. Network interruption triggers an explicit stop; a failed stop leaves the controls available for retry. Quitting waits for pending capture setup and releases SDK listeners.

## Verification boundary

Local checks have covered unit tests, TypeScript, the app manifest build, renderer navigation, packaging, and native SDK startup. A desktop recording was verified on September 7–8, 2026: Recall completed the audio and transcript, and the local **Apple** workspace stored the recording, transcript, and summary. This validates that desktop recording path; it does not validate every call provider or calendar-bot behavior.

The backend test suite covers desktop provisioning, webhook processing, recovery, import, summaries, and charge calculation. These tests mock billing. The local Twenty server has billing disabled, so the recording test did **not** verify a workspace credit deduction.

Before production release, resolve these platform billing issues:

- Recording provisioning does not check available workspace credits before creating a Recall upload.
- A recording is marked complete before its charge succeeds. Billing failures are swallowed by the SDK, with no durable retry or per-recording idempotency key at the billing endpoint.
- App charges record usage without decrementing Twenty's cached available-credit balance.

Then verify deductions and exhausted-credit behavior in a billing-enabled test workspace, including safe retries without duplicate charges. Cloud deployment and billing remain unverified. Signing, notarization, update delivery, and supported-provider recording checks are also required before distribution.

References: [Recall Desktop SDK](https://docs.recall.ai/docs/desktop-sdk), [platform support](https://docs.recall.ai/docs/dsdk-supported-platforms), [system audio capture](https://docs.recall.ai/docs/adhoc-meetings-in-person-meetings), [Muesli inspiration](https://github.com/recallai/muesli-public).

## Local end-to-end testing

The local test server runs in Docker as `twenty-app-dev-test` at
`http://localhost:2021`. Its seeded workspace is **Apple**; both the login email
and password are `tim@apple.dev`. Seeded meetings are sample data, not a live
Google or Microsoft calendar connection.

From `packages/twenty-apps/public/companion`:

```sh
yarn twenty -r companion-local apply
```

The `companion-local` remote targets port 2021. It is separate from the normal
local development database. The local server administrator must claim the
Desktop Recorder registration for Apple so its server webhook can resolve the
installed function. Configure Recall in that registration's server variables.

In Twenty Settings, disconnect the cloud workspace, enter
`http://localhost:2021`, and authorize the local Apple workspace. For the first
live test, complete permission setup, choose **New recording**, speak for about
20 seconds, then choose **Finish**. Check Recordings and the Call Recordings object in local
Twenty for processing and transcript arrival. Keep Docker and the webhook
tunnel running until processing finishes.

The Recall callback uses a temporary Cloudflare tunnel to port 2021 and the
path `/webhooks/server/2f955a7f-9d03-44c6-bb12-fbc8f6e33b07`. Restarting a quick
tunnel changes its URL; update the dedicated Recall local-test webhook endpoint
when that happens. Stop or disable that endpoint when the local test environment
is retired. Calendar bot testing additionally requires a real connected
calendar and a meeting you intend to record.

## Renderer messages

The renderer loads its compiled English Lingui catalog once in `src/renderer/main.tsx`.
Use `i18n._('Message')` where a label is declared; translate each branch of a
conditional separately so extraction can see every message. Pass translated
strings into presentation components. Typed recording notices are translated in
`notice-message.ts`, including named interpolation values.

Run `yarn lingui:extract` after changing copy. Build, preview, and packaging
commands compile the catalog. English is the only shipping locale for now.
