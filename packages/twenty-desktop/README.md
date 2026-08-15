# twenty-desktop

A Tauri 2 shell that opens the deployed Twenty workspace at
`https://travis-twenty.fly.dev`. It does not bundle `twenty-front`. A Fly
redeploy updates what this app shows.

This package is intentionally **not** a Yarn workspace member. Adding it to
the root `package.json` workspaces list would be an upstream edit.

## Scope

- Dock and native menu bar
- Global shortcut `Cmd/Ctrl+Shift+T` focuses the window
- Native notification permission on launch
- Deep links: `twenty://object/{singular}/{id}` opens
  `https://travis-twenty.fly.dev/object/{singular}/{id}`

## Run

```bash
cd packages/twenty-desktop
npm install
npm run tauri dev
```
