# Marketplace Screenshots

The Codex marketplace listing for the Twenty plugin requires ≥ 1 screenshot showing the plugin in action (Build guide §Assets).

## What to Capture

Three screenshots, all PNG, at marketplace resolution (preferably 1600×1000 or higher, 16:10):

1. **`01-create-app.png`** — `create-app` mid-flow: user prompt asking to scaffold a new Twenty app, the agent asking for the instance URL, and the `create-twenty-app` output visible.
2. **`02-develop-and-sync.png`** — `develop-app` adding an entity through `yarn twenty dev:add`, followed by `yarn twenty dev --once` syncing successfully.
3. **`03-use-twenty-mcp.png`** — `use-twenty-mcp` retrieving a workspace records table where the record-name column is rendered as a linked Markdown table.

## After Adding the Files

1. Drop the three PNGs into this directory using the exact filenames above.
2. Update `.codex-plugin/plugin.json` `interface.screenshots`:
   ```json
   "screenshots": [
     "./assets/screenshots/01-create-app.png",
     "./assets/screenshots/02-develop-and-sync.png",
     "./assets/screenshots/03-use-twenty-mcp.png"
   ]
   ```
3. Run `yarn workspace twenty-codex-plugin validate` — the planned `assertAssets` check confirms every referenced screenshot exists and is PNG.
4. Tick rows A4, A5, A6 in `CHECKLIST.md` with the reviewer's date.

## What Not to Include

No customer data, real workspace URLs, real API keys, or unreleased confidential content. Use the bundled local Docker instance or a dedicated demo workspace for captures.
