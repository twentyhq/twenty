# CLI app function logs

The command subscribes to POST `/metadata`,
`logicFunctionLogs(input: LogicFunctionLogsInput!)`, application universal
identifier and optional exact function name or universal identifier. It receives
future completed-execution output, not history or per-line execution progress.
Names can repeat within one app; name selection is a filter matching all of them.

## Contract

- `app logs` uses the CLI app-identity worker. Only the app definition is needed;
  no function bundles, full manifest build or generated client is required. Source
  diagnostics use CLI output, and target credentials stay outside the worker.
- The CLI target supplies OAuth or API-key credentials, environment proxy
  routing and cancellation. Server authorization requires `WORKFLOWS`,
  workspace scoping and per-payload application access checks. There is no
  execution mutation, app registration or workspace audit-log query.
- The selection requests nullable `name` and `universalIdentifier` fields. Server
  schemas rejecting only these fields trigger one explicit, warned fallback to
  `{ logs }`, before any record has been emitted. Unrelated validation,
  authorization, network and execution errors are never retried. An explicit
  filter provides that identity if the server cannot; unknown values stay null.
- A pull-driven reader uses the GraphQL `next`/`complete` SSE protocol,
  awaits output and reads the next
  frame only when the consumer is ready. It handles comments, multiline data,
  split UTF-8 and LF/CRLF/CR framing. Each frame is capped at 16 MiB; the session
  has no total byte cap. Reader locks and HTTP requests are released on exit.
- Setup has a 60-second deadline. After setup there is no whole-session timer;
  the HTTP body's 60-second idle deadline detects missing heartbeats. Yoga sends
  comments every 12 seconds in production. Undici suspends its body deadline
  while the body is paused for backpressure and refreshes it on resume.
- There is no automatic reconnect or replay. EOF without `complete`, broken
  JSON or records, redirects, oversized frames and network failures stop the
  command. Errors retain `recordCount`; network failures explain the gap.
  Explicit server completion exits 0, Ctrl+C exits 130. Human text escapes
  terminal control characters; NDJSON emits start, connection progress, records
  and a final result/error. A compatibility fallback may establish two
  connections and therefore emit two connection progress events.

Tests cover the public command with a real local HTTP transport, duplicate-name
filters, compatibility failures, proxy routing, per-frame bounds, output
backpressure, idle heartbeats, stalled connections, completion and cancellation.
These tests verify protocol behavior, not live workspace authorization or
execution.
