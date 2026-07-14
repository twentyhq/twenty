# Chat assistant integrations plan (Slack, Discord, Teams)

Goal: let users talk to their Twenty workspace from chat tools, Attio-style
(https://attio.com/apps/slack). In Slack, mentioning `@twenty` or DMing the bot
with "create an invoice for customer X" should run an AI agent that reads and
writes workspace records and replies in the thread.

This document is the implementation plan. Slack ships first; Discord and Teams
reuse the same architecture.

## What exists today

### The `twenty-slack` app (packages/twenty-apps/public/twenty-slack)

Already covers the outbound direction (Twenty -> Slack):

- `defineConnectionProvider` for Slack OAuth (`slack-connection.ts`): bot-token
  OAuth v2, client id/secret stored as app server variables, per-user or
  workspace-shared connections with automatic token refresh.
- Logic functions for `chat.postMessage`, `chat.update`, `chat.delete`,
  `chat.postEphemeral`, `reactions.add`, `conversations.list`, each exposed as
  agent tools (`toolTriggerSettings`) and workflow steps
  (`workflowActionTriggerSettings`).
- Two authenticated HTTP routes and a command menu quick-send form.

What is missing is the inbound direction: Slack -> Twenty events, and an agent
loop behind them.

### Platform primitives we can build on

All of these exist in the app platform today; no core changes are strictly
required for an MVP:

- Public HTTP routes: `defineLogicFunction` +
  `httpRouteTriggerSettings: { path, httpMethod, isAuthRequired: false, forwardedRequestHeaders }`
  (`packages/twenty-shared/src/application/logicFunctionManifestType.ts`).
  Handlers receive `rawBody` (needed for Slack HMAC signature verification) and
  only the headers listed in `forwardedRequestHeaders`. The Fireflies app
  (`packages/twenty-apps/public/twenty-fireflies`) is a working reference for a
  public webhook with HMAC verification.
- Routes are resolved per workspace from the request host and served under
  `/s/<path>` (`route-trigger.service.ts`), so each Twenty workspace install
  gets its own webhook URL. For a single shared endpoint across many
  workspaces there is a second mechanism, `serverRouteTriggerSettings` +
  resolver function (`server-route-trigger.controller.ts`), which dispatches to
  a target workspace decided by the resolver.
- Agents: `defineAgent` (prompt, model, response format) and the `runAgent`
  GraphQL mutation, callable from logic functions via the SDK helper
  (`twenty-sdk/src/sdk/logic-function/agents/run-agent.ts`). The executor
  (`agent-async-executor.service.ts`) binds registry tools in categories
  `DATABASE_CRUD` and `ACTION`, scoped by the role assigned to the agent, so an
  agent with a CRM role can create invoices, look up people, update deals, and
  also call this app's own Slack tools. Credit metering and model provider
  config (Anthropic, OpenAI, etc.) are already handled.
- Custom objects + database event triggers: `defineObject` and
  `databaseEventTriggerSettings` give us a durable async queue without new
  infrastructure (needed because Slack requires a 3-second webhook ack while
  agent runs take longer).
- Secrets: app `serverVariables` (encrypted, injected as env vars into logic
  functions) for the Slack signing secret.
- MCP endpoint (`POST /mcp`) with OAuth 2.1 + dynamic client registration
  already exists on the server. Third-party Slack AI clients can already
  connect to Twenty through it with zero code. Our own in-platform agent does
  not need to go through MCP: it uses the same tool registry that MCP exposes,
  directly.

## Architecture decision

Two options were considered:

1. External bot service (Bolt app hosted separately) that authenticates to
   Twenty via OAuth 2.1 and calls the `/mcp` endpoint with its own LLM loop.
2. Extend the existing `twenty-slack` app in-platform: public route receives
   Slack events, an app-defined agent executes the request, existing Slack
   tools post the reply.

Recommendation: option 2. It reuses the agent runtime, model billing, role
based permissions, the existing Slack OAuth connection, and app distribution,
and it works identically for cloud and self-hosted instances with no extra
service to deploy or operate. Option 1 remains available for third parties via
the public MCP endpoint, and nothing in this plan blocks it.

The answer to "should this live in `packages/twenty-apps/public/twenty-slack`"
is yes: that app already owns the Slack OAuth connection and the Slack tools
the assistant needs.

## Phase 1: Slack conversational assistant MVP

Scope: one Slack app per Twenty workspace (the model the current README
documents: each customer creates a Slack app at api.slack.com and pastes
client id/secret). `@twenty` mentions and DMs are answered by an agent with
CRM access; replies land in the originating thread.

### Slack app configuration changes (docs update)

- New bot scopes: `app_mentions:read`, `im:history`, `im:read`, `im:write`,
  `channels:history`, `groups:history`, `users:read`, `users:read.email`
  (identity mapping in phase 2), on top of the existing posting scopes.
- Enable Events API, subscribe to `app_mention` and `message.im`, request URL
  `<server-or-app-domain>/s/slack/events`.

### Changes in `twenty-apps/public/twenty-slack`

1. `application.config.ts`: add `SLACK_SIGNING_SECRET` server variable
   (`isSecret: true`).
2. `connection-providers/slack-connection.ts`: add the new scopes (existing
   installs must reconnect; README already documents this).
3. New logic function `slack-events-route` with
   `httpRouteTriggerSettings: { path: '/slack/events', httpMethod: 'POST', isAuthRequired: false, forwardedRequestHeaders: ['x-slack-signature', 'x-slack-request-timestamp', 'x-slack-retry-num'] }`.
   Responsibilities, all fast so Slack gets its 200 within 3 seconds:
   - Answer `url_verification` challenges.
   - Verify the `v0=` HMAC of `rawBody` against `SLACK_SIGNING_SECRET`, with
     timestamp freshness check (mirror the Fireflies util, `timingSafeEqual`).
   - Drop bot messages, message edits, and Slack retries (`x-slack-retry-num`).
   - Deduplicate on `event_id`.
   - Enqueue: create a `slackAssistantTask` record (channel, thread_ts, user,
     text, event_id, status `pending`) and return 200.
4. New custom object `slackAssistantTask` (`defineObject`): the queue plus a
   free audit log of every bot interaction. Dedup falls out of a unique index
   on `event_id`.
5. New logic function `slack-assistant-worker` with
   `databaseEventTriggerSettings` on `slackAssistantTask` creation:
   - Post an immediate "On it" placeholder message (or eyes reaction) in the
     thread via the shared Slack connection.
   - Fetch thread context with `conversations.replies` (bounded, e.g. last 20
     messages) so follow-ups work.
   - Call `runAgent` with the assistant agent, passing the request text, the
     thread context, and the Slack user's display name.
   - `chat.update` the placeholder with the agent's answer, formatted as Slack
     markdown. Mark the task `done` or `failed` with the error.
6. New agent `twenty-slack-assistant` (`defineAgent`): prompt covering CRM
   assistant behavior, safety rules (confirm before destructive actions,
   never invent record ids), and Slack formatting guidance.
7. New role for the agent (`defineRole`, `canBeAssignedToAgents: true`) with
   read/write on CRM objects. The current default app role grants no CRM
   access and stays as-is for the webhook route; only the agent gets data
   access. Whether the agent role ships with full-workspace CRM access or a
   narrower default is an admin-facing decision; make it editable per
   workspace.
8. Tests: unit tests (vitest) for signature verification, event parsing,
   dedup, Slack markdown conversion; extend the existing integration test.
9. README: setup walkthrough for Events API, signing secret, and the new
   scopes.

Open verification items for the implementation PR:

- Confirm the agent-role assignment can be declared from the app manifest
  (role with `canBeAssignedToAgents` + agent in the same app) or whether the
  admin must assign the role once in settings; adjust README accordingly.
- Confirm logic function timeout ceiling is enough for agent runs (the worker
  is async, so 60-120s is acceptable; the webhook route stays at a few
  seconds).
- Confirm `conversations.replies` needs the bot in the channel for private
  channels and document it.

### Request flow

```
Slack user: "@twenty create an invoice for ACME, 1200 EUR"
  -> Slack Events API POST /s/slack/events        (public route, HMAC verified, <3s ack)
  -> slackAssistantTask record created            (queue + audit log)
  -> DB event trigger runs slack-assistant-worker
       -> placeholder message in thread
       -> runAgent(twenty-slack-assistant)        (DATABASE_CRUD + ACTION tools, role-scoped)
       -> chat.update with the result
```

## Phase 2: identity, confirmations, richer surface

- User identity: resolve the Slack user via `users.info` and match email to a
  workspace member. Use it for attribution in the audit object and to refuse
  requests from Slack users with no matching member (workspace setting).
  True per-member permission enforcement needs platform work (agent executions
  run under the app/agent role, and API keys are workspace-level, not
  member-level), so v2 scopes permissions at the agent role and records
  attribution, rather than impersonating members.
- Confirmation buttons: Block Kit approve/cancel on destructive or high-value
  actions. Requires a second public route `/slack/interactive` and signature
  verification of a form-encoded payload (verify the platform parses
  `application/x-www-form-urlencoded` bodies or fall back to `rawBody`
  parsing).
- Slash command `/twenty ...` as an alternative entry point (same queue).
- Link unfurls: subscribe to `link_shared` (`links:read`, `links:write`) and
  unfurl Twenty record URLs into Block Kit previews. This is the most visible
  Attio parity feature after the assistant itself.
- Record-change notifications to channels already work via workflows + the
  existing post-message step; document the recipe instead of building anything.

## Phase 3: official hosted Slack app (Attio distribution model)

One Slack Marketplace app operated by Twenty, installable into any Slack
workspace and connectable to any Twenty cloud workspace:

- Single events endpoint using `serverRouteTriggerSettings` + resolver: the
  resolver maps Slack `team_id` to the Twenty workspace and dispatches to that
  workspace's worker function.
- The `team_id -> workspace` mapping is captured at connect time. The
  connection flow currently stores tokens and scopes but not the Slack team
  from the `oauth.v2.access` response, so either persist provider metadata on
  connections (small core change) or run a post-connect step that calls
  `auth.test` and stores the mapping in a record in the resolver's workspace.
- Slack Marketplace review requirements: privacy policy, support contact,
  scope justifications, and org-wide install support.
- Self-hosted instances keep the phase 1 model (their own Slack app), which is
  also what ships in the meantime.

## Discord and Teams

`packages/twenty-apps/public/twenty-discord` already exists with the same
outbound shape (bot-token based, post/update/delete/reactions/list tools).

- Discord: slash commands and mentions of the assistant should go through the
  Interactions Endpoint URL (HTTP webhook, Ed25519 signature verification via
  `x-signature-ed25519` / `x-signature-timestamp` headers, forwarded the same
  way as Slack's). That fits public routes exactly. Deferred responses
  (`type: 5`, then edit the followup) map to the same queue/worker pattern.
  Listening to plain channel messages, however, requires a persistent Gateway
  websocket, which serverless logic functions cannot hold; scope Discord to
  slash commands + `@mention` via interactions, which covers the use case.
- Teams: a Bot Framework bot (Azure Bot registration) delivers activities via
  HTTPS webhook with JWT validation, so the same route + queue + agent + reply
  pattern applies; a new `twenty-teams` app mirrors `twenty-slack` with
  Bot Framework auth instead of HMAC.
- Extract shared pieces (queue object shape, worker skeleton, agent prompt,
  markdown conversion) into a small shared util or template once Slack ships,
  rather than abstracting up front.

## Risks and open questions

- Latency: agent runs of 10-60s are normal; the placeholder-then-update
  pattern is the mitigation. If DB-event trigger dispatch latency proves too
  high, add a direct async invocation path for logic functions (platform
  enhancement).
- Permissions: v1 acts with the agent role for everyone in the Slack
  workspace who can see the bot. This must be prominent in the README; the
  role is the safety boundary.
- Prompt injection: thread context and record data flow into the agent
  prompt. The confirmation-button flow (phase 2) is the mitigation for write
  actions triggered by content the requester did not author.
- Credits: each interaction costs function invocations plus agent tokens;
  surface usage in the existing AI billing/monitoring.

## Suggested delivery order

1. Phase 1 PR on `twenty-slack` (events route, queue object, worker, agent,
   role, docs, tests).
2. Phase 2 identity + confirmations + `/twenty` command.
3. Unfurls.
4. Discord interactions endpoint on `twenty-discord`.
5. Phase 3 hosted multi-tenant app + Slack Marketplace submission.
6. Teams app.
