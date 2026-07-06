# Activity creator

A [Twenty](https://twenty.com) internal application that exposes logic functions as workflow nodes and AI tools so you can create a Task or a Note - already linked to a Person, Company or Opportunity - in a single step.

## Why it exists

Tasks and Notes are linked to records through separate `taskTargets` / `noteTargets` records. From a workflow that previously meant chaining a "create task" step with a code step that creates the target. These functions bundle both writes into one node, and expose the target as a **record picker** in the workflow builder.

## Functions

Each function is bound to one object so the workflow builder can render a record picker scoped to it (a record input binds to exactly one object's `universalIdentifier`).

| Function                       | Creates | Linked to   |
| ------------------------------ | ------- | ----------- |
| `create-task-for-person`       | a Task  | Person      |
| `create-task-for-company`      | a Task  | Company     |
| `create-task-for-opportunity`  | a Task  | Opportunity |
| `create-note-for-person`       | a Note  | Person      |
| `create-note-for-company`      | a Note  | Company     |
| `create-note-for-opportunity`  | a Note  | Opportunity |

Tasks accept `title` (required), `body`, `status` (`TODO`, `IN_PROGRESS`, `DONE`), `dueAt` and `assigneeId`. Notes accept `title` (required) and `body`. All require a `targetRecordId` (the linked record).

- In the **workflow builder**, `targetRecordId` renders as a record picker for the bound object.
- As an **AI tool**, `targetRecordId` is the record id string.

## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
