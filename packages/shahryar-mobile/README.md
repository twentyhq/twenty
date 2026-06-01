# Shahryar Mobile

Expo React Native app foundation for the `موشریف` mobile workflow.

Current scope:

- Username/password entry screen.
- Today's assigned `مارکێت` list.
- Check-in form with GPS capture and visit report fields.
- Offline visit queue persisted with `expo-sqlite`.
- Sync conflict utility where the server snapshot wins when it is newer.

Planned backend wiring:

- Authenticate through the existing Shahryar username/password endpoint.
- Pull assigned markets for the signed-in supervisor.
- Upload queued visits, GPS coordinates, and photo file URIs.
- Surface unresolved conflicts to `تەدمین` in the web app.

Run locally after installing the Expo workspace dependencies:

```bash
npx nx start shahryar-mobile
npx nx test shahryar-mobile
```
