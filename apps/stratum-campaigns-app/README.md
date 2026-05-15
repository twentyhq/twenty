# Stratum Campaigns

Twenty App that surfaces Campaign targets (People + Companies) as dedicated
tabs on the Campaign record page, with status visibility and inline editing.

The `campaign` and `campaignMember` objects themselves live in
`scripts/stratum/migrations/020-campaigns.py` — this app only adds UI on top.

## What it ships

Two `FRONT_COMPONENT` widgets:

| Widget | Tab on Campaign | Purpose |
|---|---|---|
| `campaign-people-targets` | People | Scrollable table of CampaignMembers where `targetPerson` is set. Inline status edit, "+ Add Person" picker, click row to open the CampaignMember record. |
| `campaign-company-targets` | Companies | Same for `targetCompany`. |

Both tabs are wired in by SQL migration
`scripts/stratum/layout-migrations/017-campaign-target-tabs.sql`, which also
removes the legacy single-card Members widget from the Home tab.

## Deploy

Bump the `version` in `package.json` first (so the new tarball is visibly
distinct from the previous one), then:

```bash
bash -c "export PATH='/home/clive/.nvm/versions/node/v24.15.0/bin:\$PATH' && \
  cd /home/clive/_Projects/stratum/twenty/source/apps/stratum-campaigns-app && \
  yarn install && yarn twenty deploy --remote uat && yarn twenty install --remote uat"
```

`yarn twenty install` against an already-installed app takes the upgrade
path — it diffs the new manifest against the installed state and applies
the delta without dropping data. NEVER use `yarn twenty uninstall` on an
environment with real data (it drops every workspace table the app declared).

After deploy + install, run the SQL layout migration to wire the front
components into the campaign page layout. The `frontComponent.id` changes
on every reinstall, so re-run this every time:

```bash
B64=$(base64 -w0 scripts/stratum/layout-migrations/017-campaign-target-tabs.sql)
railway ssh --service twenty --environment uat -- \
  "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"
```

Then flush the flat-entity cache:

```bash
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata"
```

Hard-refresh the browser. The People and Companies tabs should appear on
any Campaign record page.

See the `deploy-twenty-app` and `manage-record-layout` skills in
`claude-config/projects/stratum-twenty/skills/` for the full playbooks.
