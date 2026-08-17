# Slack app tests

## Layers

| Suite                                 | Command          | What it runs against                                                 |
| ------------------------------------- | ---------------- | -------------------------------------------------------------------- |
| Unit (`*.test.ts`)                    | `yarn test:unit` | Pure functions, with the modules around them mocked. No server.      |
| Integration (`*.integration-test.ts`) | `yarn test`      | The real handlers, a live Twenty server, and a fake Slack workspace. |

The integration suite needs a Twenty server; `src/__tests__/global-setup.ts`
deploys and installs the app on it before the first test and uninstalls it
after the last one. CI spawns that server (see `ci-twenty-apps.yaml`); locally,
point `TWENTY_API_URL` / `TWENTY_API_KEY` at your own instance.

## What is real and what is faked

`setupSlackIntegrationTest()` starts an [MSW](https://mswjs.io) server for the
calling test file. Slack does not publish a mock of its Web API, so the suite
carries its own:

- **Slack Web API** (`utils/create-slack-api-mock.util.ts`) - a small stateful fake of the
  endpoints the app uses (channels, messages, threads, reactions, ephemerals,
  assistant statuses, `auth.test`). The app talks to it through the real
  `@slack/web-api` client, so argument serialization, pagination, token
  handling and the `ok: false` error shapes are all exercised. Tests assert on
  what landed in the fake workspace, and can inject Slack failures with
  `failNextCall()` or `rejectMarkdownText()`.
- **App runtime services** (`utils/create-app-runtime-mock.util.ts`) - `kv`,
  `listConnections`, `getConnection` and `runAgent` are GraphQL calls the
  server only answers for an application-scoped token, which a workspace API
  key is not. They are answered in-memory with the same semantics the server
  implements (including the cross-workspace `SERVER` key claim rules).
- **Everything else is real**: Slack Assistant Request records are created,
  read and updated on the live server through `CoreApiClient`. Localhost
  traffic passes through to that server; any other unmocked request fails the
  test with a 500, the way `http-mock.util.ts` does in `twenty-server`.

Helpers follow the `twenty-server` integration test layout, one export per
file: `utils/*.util.ts` for behaviour, `types/*.type.ts` for shared shapes,
`constants/*.constant.ts` for shared test values.

`slack-deployed-functions.integration-test.ts` sits one level further out: it
uses `functionExecute` from `twenty-sdk/cli` to run the functions the way the
server runs them - deployed, in the app runtime, with the app's own access
token and server variables - and asserts on the returned status, data and
error.
