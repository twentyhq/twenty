# Activity tools

A [Twenty](https://twenty.com) internal application that exposes two logic functions as workflow nodes and AI tools so you can create a Task or a Note - already linked to a record - in a single step.

## Why it exists

Tasks and Notes are linked to records through separate `taskTargets` / `noteTargets` records. From a workflow that previously meant chaining a "create task" step with a code step that creates the target. These tools bundle both writes into one node.

## Tools

| Tool          | Creates                            | Optional target               |
| ------------- | ---------------------------------- | ----------------------------- |
| `create-task` | a Task (`title`, body, status, due date, assignee) | links it to any record via `taskTarget` |
| `create-note` | a Note (`title`, body)             | links it to any record via `noteTarget` |

Both tools accept an optional `targetObject` (the singular object name, e.g. `person`, `company`, `opportunity`, or any custom object) plus a `targetRecordId`. The morph field name (`target<Object>Id`) is built dynamically, so the tools work with custom objects too.

## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
