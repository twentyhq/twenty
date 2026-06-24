# ChatGPT App Submission Status

This plugin is wired to a separate ChatGPT app for the Codex marketplace:

- App name: Twenty Developer Tools
- App id: `asdk_app_6a3bf414b7cc8191a0e2030906ca8a66`
- App version id: `asdk_app_v_6a3bf41576a48191b59cce228526a65e`
- MCP server URL: `https://docs.twenty.com/mcp`

The app is intentionally separate from the existing Twenty CRM workspace tools app.

## Prepared Locally

- `.app.json` declares the public Twenty Developer Tools app id.
- `.codex-plugin/plugin.json` points `apps` to `./.app.json`.
- `package.json` includes `.app.json` in published files.
- `chatgpt-app-submission.json` contains app info, tool justifications, five positive test cases, and three negative test cases for import into the OpenAI Platform app review form.
- Validators enforce the app id, app declaration, package files entry, and marketplace template shape.

## OpenAI Platform Draft

Created under the Twenty organization in OpenAI Platform as `Twenty Developer Tools`.

Status: submitted for OpenAI review. The OpenAI Platform app list shows version `1.0.0` with status `Review`.

Uploaded during draft preparation:

- `chatgpt-app-submission.json`
- `assets/twenty-logo.png`

Saved App Info values:

- App name: `Twenty Developer Tools`
- Subtitle: `Build Twenty apps`
- Developer: `Twenty PBC`
- Website URL: `https://twenty.com/`
- Customer Support URL or Email Address: `contact@twenty.com`
- Privacy Policy URL: `https://twenty.com/privacy-policy`
- Terms of Service URL: `https://twenty.com/terms`
- Demo Recording URL: `https://raw.githubusercontent.com/twentyhq/twenty/adcf8a615c0f05fa214fd4bd64d8ce470116ec35/submission-assets/twenty-developer-tools-demo.mp4`

The demo recording was generated from a real ChatGPT Developer Mode conversation using the public Twenty docs MCP endpoint. It shows both declared tools being invoked.

The MCP Server step has been scanned successfully for `https://docs.twenty.com/mcp` with `No Auth`. Tool justifications were entered manually because the JSON import did not auto-fill them after scanning.

Domain verification used this token:

```text
GmIMFesuj8xvCg3AIdW2yXJvqU85nIl2yn6meatbPLg
```

The website challenge file at `packages/twenty-website/public/.well-known/openai-apps-challenge` has been updated to that token. Platform accepts a parent hostname for the MCP hostname, so the verification base URL was `https://twenty.com` and the verified public URL was `https://twenty.com/.well-known/openai-apps-challenge`.

## Remaining Steps

Wait for OpenAI review to complete. If review requests changes, update the Platform app version and this plugin branch together so the `.app.json` app id and submission artifacts remain in sync.
