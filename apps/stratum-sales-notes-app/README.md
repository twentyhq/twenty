# Stratum Sales Notes

Twenty App that adds a `salesNote` object — sales-rep call/meeting notes — with:

- AI-summarised body (`summary` field, populated via `/rest/ai/generate-text`)
- "Extract tasks" front-component that turns time-defined future actions in the
  note ("call client in 6 months", "send proposal next Tuesday") into Twenty
  Tasks linked to the same attendees / account / opportunity.

Foundation for issues [#102](https://github.com/StratumCM/CRM/issues/102) and
[#103](https://github.com/StratumCM/CRM/issues/103). Forked structurally from
the upstream `packages/twenty-apps/internal/call-recording/` prototype, stripped
of media-recording bits and adapted for typed (or, later, Whisper-transcribed)
notes.

## Schema

| Field on `salesNote` | Type | Notes |
|---|---|---|
| `name` | TEXT | Title |
| `body` | RICH_TEXT | Rep-typed notes (or Whisper output later) |
| `summary` | RICH_TEXT | AI digest |
| `status` | SELECT | `DRAFT` / `FINAL` |
| `audioFile` | FILES | Reserved for #103 |
| `attendees` | M2M Person | via `salesNoteAttendee` junction |
| `company` | MANY_TO_ONE Company | optional |
| `opportunity` | MANY_TO_ONE Opportunity | optional |
| `owner` | MANY_TO_ONE WorkspaceMember | the sales rep |

## Deploy

```bash
bash -c "export PATH='/home/clive/.nvm/versions/node/v24.14.0/bin:\$PATH' && \
  cd /home/clive/_Projects/stratum/twenty/source/apps/stratum-sales-notes-app && \
  yarn install && yarn twenty deploy --remote uat"
```

After deploy, install via UAT UI: Settings → Applications → Stratum Sales Notes → Install.
Then flush the flat-entity cache:

```bash
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata"
```

See `.claude/skills/deploy-twenty-app/` for the full deploy playbook.
