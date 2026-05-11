---
description: Start, reset, or troubleshoot the local Twenty contributor dev stack
---

Use the `dev-server` skill to start, restart, reset, inspect, or troubleshoot the local Twenty contributor development stack (server, worker, frontend, Redis, PostgreSQL, Storybook, email preview).

User input: $ARGUMENTS

If `$ARGUMENTS` names a specific operation (`start`, `reset`, `pr <id>`, `troubleshoot <symptom>`), follow the matching workflow from the skill. Otherwise, confirm the user is at the Twenty repo root and walk through the standard start workflow: Redis, server, worker, frontend.
