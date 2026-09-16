# Workspace installation and personal sign-in

1. A workspace administrator installs **Desktop Recorder** in Twenty Settings → Apps and configures its recording provider.
2. Its Settings tab includes **Download Twenty for macOS**. Members can also find the same read-only instructions in Settings → Desktop app, without application administration permission.
3. Each member installs **Twenty**, enters their workspace URL, and authorizes the existing Desktop Recorder OAuth client in their browser.
4. Twenty checks the backend recording configuration before saving the desktop connection. It never creates or installs another application during desktop sign-in.

Desktop authentication is a public OAuth client using loopback redirects and PKCE. Access and refresh tokens retain the authorizing user and workspace identity. Disconnect revokes the personal grant; it does not uninstall the workspace application.

## Download distribution

No desktop installer was found among Twenty's published GitHub releases on 2026-09-08. Do not use an assumed release URL.

Run `yarn package:archive` in `packages/twenty-companion` to create `release/Twenty-0.1.0-macos-arm64.zip` and its SHA-256 checksum. This is a development build. Production distribution still needs Developer ID signing and notarization before uploading to a release host, such as the existing `twentyhq/twenty` GitHub Releases.

Once the verified installer is hosted, set **macOS download URL** (`DESKTOP_DOWNLOAD_URL`) in Desktop Recorder's settings to its HTTPS download URL. An empty or invalid URL disables the download button. The current build supports Apple silicon and macOS 14.2+, not Windows or Intel Macs.

Deploy the updated Twenty server/frontend and sync or upgrade Desktop Recorder before distributing the updated desktop app. Registration creation and manifest updates configure its existing OAuth client as a public native client. Earlier OAuth-only registrations are not deleted automatically; reconnect through the installed integration before an administrator removes obsolete registrations.

## Architecture context

[Martmull app archi, September 8](https://app.fireflies.ai/view/01M20GB6PQH23MN9ZZCRN94Z0K) confirmed one installed app with separate user connections, ownership associated with each workspace member, and a two-user verification. General user-level app settings can follow later.

Linear connection providers authorize Twenty to call an external service. Desktop authorization runs in the other direction: Electron calls Twenty. Reusing the installed app registration avoids empty apps without creating a provider that has no external service to connect to. Provider import loops remain app-specific when integrating external services.

Personal desktop agenda and upload ownership checks do not themselves establish CRM row-level privacy. CRM record visibility follows workspace roles. User/workspace connection visibility must not be presented as a guarantee of private CRM records without explicit row-level permission enforcement and multi-user verification.
